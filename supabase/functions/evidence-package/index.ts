import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { extractApiKey, resolvePlatformByApiKey } from "../_shared/platform-key.ts";
import { sha256HexText } from "../_shared/registry.ts";

/**
 * POST /v1/evidence-package — SPEC-CP-02 §8.
 * One command. Signed at export. The export is itself logged.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    const apiKey = extractApiKey(req);
    if (!apiKey) return json({ error: "missing_api_key" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const platform = await resolvePlatformByApiKey(supabase, apiKey);
    const body = await req.json().catch(() => ({}));
    const agreement_id = String(body.agreement_id || "");
    if (!agreement_id) return json({ error: "agreement_id required" }, 400);

    const { data: agr, error } = await supabase
      .from("agreements")
      .select("*")
      .eq("agreement_id", agreement_id)
      .eq("platform_id", platform.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!agr) return json({ error: "agreement_not_found" }, 404);

    const { data: parties } = await supabase
      .from("agreement_parties")
      .select("*")
      .eq("agreement_id", agreement_id);
    const { data: contract } = await supabase
      .from("contracts")
      .select("contract_id, body, content_hash")
      .eq("contract_id", agr.contract_id)
      .maybeSingle();
    const { data: serve_events } = await supabase
      .from("serve_events")
      .select("*")
      .eq("agreement_id", agreement_id);
    const { data: ledger } = await supabase
      .from("record_ledger")
      .select("*")
      .or(`row_key.eq.${agreement_id},row_key.like.${agreement_id}:%`)
      .order("seq");

    const hashes_match =
      !!contract && contract.content_hash === agr.content_hash;
    const method =
      "SHA-256 of contract body copied onto the agreement. Ledger entry_hash = SHA-256 of table_name, row_key, row_hash, prev_hash, written_at joined by unit separator. Chain verifies by recomputing from seq 1.";

    const manifest = {
      agreement: agr,
      parties: parties ?? [],
      contract_bytes: contract?.body ?? null,
      contract_content_hash: contract?.content_hash ?? null,
      agreement_content_hash: agr.content_hash,
      hashes_match,
      serve_events: serve_events ?? [],
      ledger_segment: ledger ?? [],
      signed_heads: { note: "offbox.ledger_daily_heads — app role cannot read" },
      method,
    };
    const export_hash = await sha256HexText(JSON.stringify(manifest));
    const { error: logErr } = await supabase.from("record_ledger").insert({
      table_name: "evidence_package",
      row_key: agreement_id,
      row_hash: export_hash,
      entry_hash: "pending",
    });
    return json({
      manifest,
      export_hash,
      logged: logErr ? { error: logErr.message } : { table: "record_ledger", row_key: agreement_id },
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
