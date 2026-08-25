import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * POST /v1/identity-join — SPEC-CP-02 §7.
 * Named authority. Every execution logged. The join itself is not built here —
 * the log is. An unlogged join is the failure mode that ends the company.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const body = await req.json().catch(() => ({}));
    const who = typeof body.who === "string" ? body.who.trim() : "";
    const authority = typeof body.authority === "string" ? body.authority.trim() : "";
    const vai = typeof body.vai === "string" ? body.vai.trim().toUpperCase() : "";
    if (!who || !authority || !/^[A-Z0-9]{7}$/.test(vai)) {
      return json({ error: "who, authority and vai required" }, 400);
    }
    if (authority === "default" || authority === "service_role") {
      return json({ error: "named_authority_required" }, 403);
    }
    const { data, error } = await supabase
      .from("identity_join_log")
      .insert({ who, authority, vai })
      .select("id, who, executed_at, authority, vai")
      .single();
    if (error) throw new Error(error.message);
    return json({ logged: data, join: "not_executed" });
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
