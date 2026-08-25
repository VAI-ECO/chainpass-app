import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { extractApiKey, resolvePlatformByApiKey } from "../_shared/platform-key.ts";
import {
  computeConsumptionProjection,
  purchaseBlock,
} from "../_shared/consumption.ts";
import { getSettingNumber, refuseUnset } from "../_shared/settings.ts";

/**
 * /v1/blocks — remaining + alert vs settings:blocks_alert_threshold; purchase.
 * invoke() is always POST: body.purchase true → buy; otherwise status.
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

    const body =
      req.method === "POST" || req.method === "PUT"
        ? await req.json().catch(() => ({}))
        : {};
    const wantsPurchase =
      body?.purchase === true || body?.action === "purchase";

    if (req.method === "POST" && wantsPurchase) {
      const purchased = await purchaseBlock(supabase, platform.id);
      return new Response(JSON.stringify({ status: "purchased", ...purchased }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" || req.method === "POST") {
      const projection = await computeConsumptionProjection(supabase, platform.id);
      const alertAt = await getSettingNumber(supabase, "blocks_alert_threshold") ?? refuseUnset("blocks_alert_threshold");
      const alert_low = projection.remaining <= alertAt;
      return new Response(
        JSON.stringify({
          status: "ok",
          ...projection,
          alert_low,
          alert_threshold_key: "blocks_alert_threshold",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
