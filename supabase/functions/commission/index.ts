import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { extractApiKey, resolvePlatformByApiKey } from "../_shared/platform-key.ts";
import { accrueCommission } from "../_shared/commission.ts";

/**
 * POST /v1/commission/accrue — internal/admin shape for origination|renewal events.
 * GET  /v1/commission — list accrued rows for the calling platform (payee view).
 * Ledger holds trolley_recipient_id only — never name/bank/tax.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = extractApiKey(req);
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "missing_api_key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const platform = await resolvePlatformByApiKey(supabase, apiKey);

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const vai = String(body.vai || "").trim().toUpperCase();
      const event = body.event === "renewal" ? "renewal" : "origination";
      if (!vai) {
        return new Response(JSON.stringify({ error: "vai required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const result = await accrueCommission(supabase, {
        platform_id: platform.id,
        vai,
        event,
        period: typeof body.period === "string" ? body.period : undefined,
      });
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("commission_ledger")
        .select(
          "id, platform_id, vai, event, amount, period, status, trolley_recipient_id, created_at"
        )
        .eq("platform_id", platform.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ rows: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
