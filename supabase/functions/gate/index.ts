import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { agreementMeetsEndpointLevel } from "../_shared/gate-level.ts";
import { extractApiKey, resolvePlatformByApiKey } from "../_shared/platform-key.ts";

/**
 * POST /v1/gate — item 1: key → platform → level check (§14.1 / §16.3).
 * Body: { required_level: 1|2|3 } — the endpoint's required level for this call.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405);
    }

    const apiKey = extractApiKey(req);
    if (!apiKey) {
      return json({ error: "missing_api_key" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const required_level = Number(body.required_level);
    if (![1, 2, 3].includes(required_level)) {
      return json({ error: "required_level must be 1, 2, or 3" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const platform = await resolvePlatformByApiKey(supabase, apiKey);

    // §14.1 — ONE INTEGER COMPARISON. Nothing else.
    if (!agreementMeetsEndpointLevel(platform.service_level!, required_level)) {
      return json(
        {
          status: "level_refused",
          // No credential work, no visits, no face — level gate failed first.
        },
        403
      );
    }

    return json({
      status: "level_ok",
      platform_id: platform.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const status =
      message === "invalid platform API key" || message.startsWith("platform is")
        ? 401
        : 500;
    return json({ error: message }, status);
  }
});

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
