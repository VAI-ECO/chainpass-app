import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { getSetting, getSettingNumber } from "../_shared/settings.ts";

/**
 * Enrolment-window signature — CANON-CP-01 §14.2 items 4 and 8, §16.2.
 * Version id is resolved server-side from session.platform_id + subtype.
 * Never accepted from the client.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const session_id = typeof body.session_id === "string" ? body.session_id : "";
    const subtype = typeof body.subtype === "string" ? body.subtype : "";
    const facialMatchConfidence = body.facialMatchConfidence;

    if (!session_id) {
      return json({ success: false, error: "session_id is required" }, 400);
    }
    if (subtype !== "terms" && subtype !== "contract") {
      return json(
        { success: false, error: "subtype must be terms or contract" },
        400
      );
    }
    if (facialMatchConfidence === undefined) {
      return json({ success: false, error: "facialMatchConfidence is required" }, 400);
    }
    if (
      body.agreement_version_id !== undefined ||
      body.version_id !== undefined ||
      body.terms_version_id !== undefined
    ) {
      return json(
        {
          success: false,
          error: "agreement_version_id must not come from the client",
        },
        400
      );
    }
    if (body.contractText !== undefined || body.contract_text !== undefined) {
      return json(
        {
          success: false,
          error: "contractText rejected — body is agreement_versions.body, never copied into the proof",
        },
        400
      );
    }
    if (body.terms_doc_ref !== undefined) {
      return json({ success: false, error: "terms_doc_ref_rejected" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const minConfidence = await getSettingNumber(supabase, "band_green_min");
    const confidence01 =
      facialMatchConfidence > 1 ? facialMatchConfidence / 100 : facialMatchConfidence;
    if (confidence01 < minConfidence) {
      throw new Error("Facial match confidence too low to sign contract");
    }

    const { data: verificationRecord, error: verificationError } = await supabase
      .from("verification_records")
      .select("id")
      .eq("session_id", session_id)
      .single();

    if (verificationError || !verificationRecord) {
      return json(
        {
          success: false,
          message:
            "Verification record not found. Please complete identity verification first.",
        },
        404
      );
    }

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, platform_id, vai")
      .eq("id", session_id)
      .maybeSingle();
    if (sessionError) throw new Error(sessionError.message);
    if (!session) return json({ success: false, error: "session_not_found" }, 404);
    if (!session.vai) {
      return json({ success: false, error: "vai_must_be_live_before_signature" }, 403);
    }
    if (!session.platform_id) {
      return json({ success: false, error: "session missing platform_id" }, 400);
    }

    const vai = session.vai.trim();

    const now = new Date().toISOString();
    const { data: versions, error: verErr } = await supabase
      .from("agreement_versions")
      .select("id, platform_id, body, subtype, effective_from, version")
      .eq("platform_id", session.platform_id)
      .eq("subtype", subtype)
      .lte("effective_from", now);

    if (verErr) throw new Error(verErr.message);

    const withBody = (versions ?? []).filter((v) => typeof v.body === "string" && v.body.length > 0);

    if (withBody.length === 0) {
      return json(
        {
          success: false,
          error: "no_current_version",
          platform_id: session.platform_id,
          subtype,
        },
        404
      );
    }
    if (withBody.length > 1) {
      // §14.2 item 6 names "when it was superseded" but agreement_versions
      // has no superseded column. effective_from ≤ now matches more than one
      // row. Canon does not say which to stamp. Do not pick.
      return json(
        {
          success: false,
          error: "multiple_effective_versions",
          count: withBody.length,
          version_ids: withBody.map((v) => v.id),
        },
        409
      );
    }

    const ver = withBody[0];

    const { data: agr, error: aErr } = await supabase
      .from("agreements")
      .insert({
        platform_id: session.platform_id,
        type: "single",
        subtype,
        vai_1: vai,
        status: "complete",
        content_version_id: ver.id,
        closed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (aErr) throw new Error(aErr.message);

    const engine = await getSetting(supabase, "engine_attempt_default");
    const { data: proof, error: pErr } = await supabase
      .from("agreement_proofs")
      .insert({
        agreement_id: agr.id,
        agreement_version_id: ver.id,
        vai,
        engine_used: engine,
      })
      .select("id, agreement_id, agreement_version_id, vai, verified_at, engine_used")
      .single();
    if (pErr) throw new Error(pErr.message);

    return json({
      success: true,
      agreement_id: agr.id,
      agreement_version_id: ver.id,
      vai,
      verified_at: proof.verified_at,
      engine_used: proof.engine_used,
      session_id,
    });
  } catch (error) {
    console.error("[Sign Contract] Error:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
