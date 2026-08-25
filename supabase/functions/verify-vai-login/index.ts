import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { extractApiKey, resolvePlatformByApiKey } from "../_shared/platform-key.ts";
import { compareCaptureToBaseline } from "../_shared/band-compare.ts";
import { normaliseMatchOutput, publicMatchShape } from "../_shared/bank-adapter.ts";
import { trialApprovedBody } from "../_shared/response-level.ts";
import { publicGateBody } from "../_shared/gate-response.ts";

/**
 * POST /v1/verify-vai-login — login rail reads through the adapter only.
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
    if (body.session_key !== undefined) {
      return json({ error: "session_key_not_an_endpoint" }, 404);
    }
    const vai = typeof body.vai === "string" ? body.vai.trim().toUpperCase() : "";
    const capture = typeof body.capture === "string" ? body.capture : "";
    if (!/^[A-Z0-9]{7}$/.test(vai) || !capture) {
      return json({ error: "vai and capture required" }, 400);
    }
    if (platform.trial_mode) return json(trialApprovedBody());
    const compared = await compareCaptureToBaseline(supabase, vai, capture);
    const internal = await normaliseMatchOutput(supabase, {
      band: compared.band,
    });
    const shaped = publicMatchShape(internal, platform.response_level);
    return json({ status: compared.band === "green" ? "granted" : "denied", ...shaped });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});

function json(body: Record<string, unknown>, status = 200): Response {
  const safe = publicGateBody(body);
  return new Response(JSON.stringify(safe), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
