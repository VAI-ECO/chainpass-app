import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { agreementMeetsEndpointLevel } from "../_shared/gate-level.ts";
import {
  credentialIsActive,
  credentialMeetsRequiredLevel,
  loadCredentialForGate,
} from "../_shared/gate-credential.ts";
import { signEnrolmentToken } from "../_shared/enrolment-token.ts";
import { extractApiKey, resolvePlatformByApiKey } from "../_shared/platform-key.ts";
import {
  faceGateAgainstBaseline,
  findPlatformVisit,
} from "../_shared/gate-visits.ts";
import { recordGateConsumption } from "../_shared/gate-ledger.ts";
import { publicGateBody } from "../_shared/gate-response.ts";
import {
  askingPartyNotMet,
  holderShortfall,
  levelShortItem,
  listMissingPlatformRequirements,
  SHORTFALL_PAGE,
} from "../_shared/gate-shortfall.ts";

/**
 * POST /v1/gate — §16.3 items 1–5.
 * Every resolved call writes verification_ledger and decrements the block.
 * Responses carry a band, never a percentage (§7).
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

    const vai = typeof body.vai === "string" ? body.vai.trim().toUpperCase() : "";
    if (!/^[A-Z0-9]{7}$/.test(vai)) {
      return json({ error: "vai must be 7 alphanumeric characters" }, 400);
    }

    const capture = typeof body.capture === "string" ? body.capture : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const platform = await resolvePlatformByApiKey(supabase, apiKey);

    if (!agreementMeetsEndpointLevel(platform.service_level!, required_level)) {
      await recordGateConsumption(supabase, {
        platform_id: platform.id,
        vai,
        call_type: "gate",
        result: "level_refused",
      });
      return json({ status: "level_refused" }, 403);
    }

    const credential = await loadCredentialForGate(supabase, vai);
    if (!credential) {
      const enrolment_token = await signEnrolmentToken(platform.id);
      const cons = await finish(supabase, platform.id, vai, "enroll_required");
      if (cons.depleted) return json({ status: "block_depleted" }, 402);
      return json({ status: "enroll_required", enrolment_token });
    }

    if (!credentialIsActive(credential.state)) {
      const cons = await finish(supabase, platform.id, vai, "credential_inactive");
      if (cons.depleted) return json({ status: "block_depleted" }, 402);
      return json({ status: "credential_inactive", state: credential.state }, 403);
    }

    const missing: import("../_shared/gate-shortfall.ts").ShortfallItem[] = [];
    if (!credentialMeetsRequiredLevel(credential.credential_level, required_level)) {
      missing.push(levelShortItem(required_level));
    }
    missing.push(...(await listMissingPlatformRequirements(supabase, vai, platform.id)));
    if (missing.length > 0) {
      const cons = await finish(supabase, platform.id, vai, "shortfall");
      if (cons.depleted) return json({ status: "block_depleted" }, 402);
      if (body.asking_party === true) {
        return json(askingPartyNotMet(), 409);
      }
      const enrolment_token = missing.some((m) => m.kind === "credential_level")
        ? await signEnrolmentToken(platform.id)
        : null;
      return json(
        holderShortfall({
          missing,
          route: { url: SHORTFALL_PAGE, enrolment_token },
        }),
        409
      );
    }

    const visit = await findPlatformVisit(supabase, vai, platform.id);
    if (!visit) {
      const cons = await finish(supabase, platform.id, vai, "terms_required");
      if (cons.depleted) return json({ status: "block_depleted" }, 402);
      return json({ status: "terms_required" });
    }

    if (!capture) {
      return json({ error: "capture required for return visit" }, 400);
    }

    const { status, band } = await faceGateAgainstBaseline(supabase, vai, capture);
    const cons = await finish(supabase, platform.id, vai, status);
    if (cons.depleted) return json({ status: "block_depleted" }, 402);
    return json({ status, band });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const status =
      message === "invalid platform API key" || message.startsWith("platform is")
        ? 401
        : 500;
    return json({ error: message }, status);
  }
});

async function finish(
  supabase: SupabaseClient,
  platform_id: string,
  vai: string,
  result: string
) {
  return recordGateConsumption(supabase, {
    platform_id,
    vai,
    call_type: "gate",
    result,
  });
}

function json(body: Record<string, unknown>, status = 200): Response {
  const safe = publicGateBody(body);
  return new Response(JSON.stringify(safe), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
