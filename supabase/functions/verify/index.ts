import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { agreementMeetsEndpointLevel } from "../_shared/gate-level.ts";
import { extractApiKey, resolvePlatformByApiKey } from "../_shared/platform-key.ts";
import {
  credentialIsActive,
  loadCredentialForGate,
} from "../_shared/gate-credential.ts";
import { compareCaptureToBaseline } from "../_shared/band-compare.ts";
import { recordGateConsumption } from "../_shared/gate-ledger.ts";
import { publicGateBody } from "../_shared/gate-response.ts";
import { outcomeFromBand } from "../_shared/gate-visits.ts";

/**
 * POST /v1/verify — §16.5 in-session verify (≥2).
 * Live capture vs baseline. Exactly one ledger row + block decrement per call.
 * A credential holder at a NEW platform costs THAT platform consumption and earns it nothing.
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
    if (!apiKey) return json({ error: "missing_api_key" }, 401);

    const body = await req.json().catch(() => ({}));
    const required_level = Number(body.required_level ?? 2);
    const vai = typeof body.vai === "string" ? body.vai.trim().toUpperCase() : "";
    const capture = typeof body.capture === "string" ? body.capture : "";
    if (!/^[A-Z0-9]{7}$/.test(vai) || !capture) {
      return json({ error: "vai and capture required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const platform = await resolvePlatformByApiKey(supabase, apiKey);
    if (!agreementMeetsEndpointLevel(platform.service_level!, required_level)) {
      await recordGateConsumption(supabase, {
        platform_id: platform.id,
        vai,
        call_type: "verify",
        result: "level_refused",
      });
      return json({ status: "level_refused" }, 403);
    }

    const credential = await loadCredentialForGate(supabase, vai);
    if (!credential || !credentialIsActive(credential.state)) {
      await recordGateConsumption(supabase, {
        platform_id: platform.id,
        vai,
        call_type: "verify",
        result: "credential_inactive",
      });
      return json({ status: "credential_inactive" }, 403);
    }

    // Consumption burns THIS platform's block — originator earns nothing here (§14.5).
    const { band } = await compareCaptureToBaseline(supabase, vai, capture);
    const status = outcomeFromBand(band);

    const cons = await recordGateConsumption(supabase, {
      platform_id: platform.id,
      vai,
      call_type: "verify",
      result: status,
    });
    if (cons.depleted) {
      return json({ status: "block_depleted", admin_state: "depleted" }, 402);
    }

    return json({ status, band });
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
