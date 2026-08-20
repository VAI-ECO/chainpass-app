import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { agreementMeetsEndpointLevel } from "../_shared/gate-level.ts";
import { extractApiKey, resolvePlatformByApiKey } from "../_shared/platform-key.ts";
import {
  createAgreementVersion,
  getAgreementProof,
  openAgreement,
  verifyAgreementParty,
} from "../_shared/agreements.ts";
import { getSettingNumber } from "../_shared/settings.ts";
import { recordGateConsumption } from "../_shared/gate-ledger.ts";
import { publicGateBody } from "../_shared/gate-response.ts";

/**
 * Agreements API — §14.2 / §16.5 / level 3.
 * POST /v1/agreements
 * POST /v1/agreements/{id}/verify  (path via body.agreement_id or URL)
 * GET  /v1/agreements/{id}/proof
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = extractApiKey(req);
    if (!apiKey) return json({ error: "missing_api_key" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const platform = await resolvePlatformByApiKey(supabase, apiKey);

    if (!agreementMeetsEndpointLevel(platform.service_level!, 3)) {
      return json({ status: "level_refused" }, 403);
    }

    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    // .../agreements or .../agreements/{id}/verify or .../agreements/{id}/proof
    const agrIdx = parts.lastIndexOf("agreements");
    const id = agrIdx >= 0 && parts[agrIdx + 1] && !["verify", "proof"].includes(parts[agrIdx + 1])
      ? parts[agrIdx + 1]
      : null;
    const action = id && parts[agrIdx + 2] ? parts[agrIdx + 2] : null;

    if (req.method === "POST" && !id) {
      const body = await req.json().catch(() => ({}));
      const type = body.type === "dual" ? "dual" : "single";
      const subtype = body.subtype === "terms" ? "terms" : "contract";
      const vai_1 = String(body.vai_1 || "").trim().toUpperCase();
      const vai_2 = body.vai_2 ? String(body.vai_2).trim().toUpperCase() : null;
      const document = typeof body.document === "string" ? body.document : "";
      const version = typeof body.version === "string" ? body.version : `v${Date.now()}`;
      // §14.2c — notice is platform's words; ChainPass never summarises
      const notice = typeof body.notice === "string" ? body.notice : null;

      if (!vai_1 || !document) {
        return json({ error: "vai_1 and document required" }, 400);
      }

      const ver = await createAgreementVersion(supabase, {
        platform_id: platform.id,
        subtype,
        body: document,
        version,
        notice,
      });

      const hours = await getSettingNumber(supabase, "agreement_open_hours");
      const expires_at = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

      const agr = await openAgreement(supabase, {
        platform_id: platform.id,
        type,
        subtype,
        vai_1,
        vai_2,
        content_version_id: ver.id,
        expires_at,
      });

      return json({ status: "opened", agreement_id: agr.id, version_id: ver.id });
    }

    if (req.method === "POST" && action === "verify" && id) {
      const body = await req.json().catch(() => ({}));
      const vai = String(body.vai || "").trim().toUpperCase();
      const capture = typeof body.capture === "string" ? body.capture : "";
      if (!vai || !capture) return json({ error: "vai and capture required" }, 400);

      const result = await verifyAgreementParty(supabase, {
        agreement_id: id,
        vai,
        capture,
      });

      await recordGateConsumption(supabase, {
        platform_id: platform.id,
        vai,
        call_type: "agreement_verify",
        result: result.status,
      });

      return json(result);
    }

    if (req.method === "GET" && action === "proof" && id) {
      const proof = await getAgreementProof(supabase, id);
      return json(proof);
    }

    return json({ error: "not_found" }, 404);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});

function json(body: Record<string, unknown>, status = 200): Response {
  // Don't use publicGateBody — proof must include version body text; may have no band.
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
