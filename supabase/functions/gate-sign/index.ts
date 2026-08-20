import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { agreementMeetsEndpointLevel } from "../_shared/gate-level.ts";
import {
  credentialIsActive,
  credentialMeetsRequiredLevel,
  loadCredentialForGate,
} from "../_shared/gate-credential.ts";
import { extractApiKey, resolvePlatformByApiKey } from "../_shared/platform-key.ts";
import { signFirstVisitTerms } from "../_shared/gate-visits.ts";
import { recordGateConsumption } from "../_shared/gate-ledger.ts";

/**
 * POST /v1/gate/sign — first-visit terms + ledger/block (§16.3 items 3–4).
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
    const required_level = Number(body.required_level ?? 1);
    if (![1, 2, 3].includes(required_level)) {
      return json({ error: "required_level must be 1, 2, or 3" }, 400);
    }

    const vai = typeof body.vai === "string" ? body.vai.trim().toUpperCase() : "";
    if (!/^[A-Z0-9]{7}$/.test(vai)) {
      return json({ error: "vai must be 7 alphanumeric characters" }, 400);
    }

    const capture = typeof body.capture === "string" ? body.capture : null;
    if (!capture) {
      return json({ error: "capture required" }, 400);
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
        call_type: "gate_sign",
        result: "level_refused",
      });
      return json({ status: "level_refused" }, 403);
    }

    const credential = await loadCredentialForGate(supabase, vai);
    if (!credential) {
      await recordGateConsumption(supabase, {
        platform_id: platform.id,
        vai,
        call_type: "gate_sign",
        result: "enroll_required",
      });
      return json({ status: "enroll_required" }, 403);
    }
    if (!credentialIsActive(credential.state)) {
      await recordGateConsumption(supabase, {
        platform_id: platform.id,
        vai,
        call_type: "gate_sign",
        result: "credential_inactive",
      });
      return json({ status: "credential_inactive", state: credential.state }, 403);
    }
    if (!credentialMeetsRequiredLevel(credential.credential_level, required_level)) {
      await recordGateConsumption(supabase, {
        platform_id: platform.id,
        vai,
        call_type: "gate_sign",
        result: "credential_level_refused",
      });
      return json({ status: "credential_level_refused" }, 403);
    }

    const result = await signFirstVisitTerms(supabase, {
      vai,
      platform_id: platform.id,
      capture,
    });

    const cons = await recordGateConsumption(supabase, {
      platform_id: platform.id,
      vai,
      call_type: "gate_sign",
      result: result.status,
    });
    if (cons.depleted) {
      return json({ status: "block_depleted" }, 402);
    }

    return json({
      status: result.status,
      band: result.band,
      ...(result.agreement_id ? { agreement_id: result.agreement_id } : {}),
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
