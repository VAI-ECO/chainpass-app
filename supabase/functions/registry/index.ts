import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { extractApiKey, resolvePlatformByApiKey } from "../_shared/platform-key.ts";
import {
  displayContract,
  fetchContract,
  goLive,
  openAgreement,
  recordAnswer,
  registerContract,
  retireContract,
  searchAgreements,
} from "../_shared/registry.ts";

/**
 * POST /v1/registry — SPEC-CP-02 / CANON-CP-01 §14.6 surface 10.
 * Actions: register · fetch · retire · live · open · display · record · search.
 * Open returns an agreement number and no contract text.
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
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "register") {
      const result = await registerContract(supabase, {
        contract_id: String(body.contract_id || ""),
        platform_id: platform.id,
        family: String(body.family || ""),
        version: String(body.version || ""),
        body: String(body.body || ""),
        language: String(body.language || "en"),
        parties: body.parties === 1 ? 1 : 2,
        registered_by: String(body.registered_by || platform.id),
        supersedes: typeof body.supersedes === "string" ? body.supersedes : null,
      });
      return json(result);
    }
    if (action === "fetch") {
      const row = await fetchContract(supabase, String(body.contract_id || ""), platform.id);
      return json(row);
    }
    if (action === "live") {
      return json(await goLive(supabase, String(body.contract_id || ""), platform.id));
    }
    if (action === "retire") {
      return json(await retireContract(supabase, String(body.contract_id || ""), platform.id));
    }
    if (action === "open") {
      const vais = Array.isArray(body.vais)
        ? body.vais.map((v: unknown) => String(v).trim().toUpperCase())
        : [body.vai_1, body.vai_2].filter(Boolean).map((v: string) => v.trim().toUpperCase());
      const opened = await openAgreement(supabase, {
        contract_id: String(body.contract_id || ""),
        platform_id: platform.id,
        vais,
      });
      return json(opened);
    }
    if (action === "display") {
      const shown = await displayContract(supabase, {
        agreement_id: String(body.agreement_id || ""),
        vai: String(body.vai || "").trim().toUpperCase(),
        delivery: String(body.delivery || "chainpass_screen"),
      });
      return json(shown);
    }
    if (action === "record") {
      const answer = body.answer === "no" || body.answer === "declined" ? "no" : "yes";
      return json(
        await recordAnswer(supabase, {
          agreement_id: String(body.agreement_id || ""),
          vai: String(body.vai || "").trim().toUpperCase(),
          party_order: body.party_order === 2 ? 2 : 1,
          answer,
          match_ref: typeof body.match_ref === "string" ? body.match_ref : null,
        })
      );
    }
    if (action === "search") {
      const rows = await searchAgreements(supabase, {
        platform_id: platform.id,
        agreement_id: typeof body.agreement_id === "string" ? body.agreement_id : undefined,
        vai: typeof body.vai === "string" ? body.vai.trim().toUpperCase() : undefined,
      });
      return json({ agreements: rows });
    }
    return json({ error: "unknown_action" }, 400);
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    const status =
      message === "draft_never_served" || message === "retired_refused_at_open"
        ? 403
        : 400;
    return json({ error: message }, status);
  }
});

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
