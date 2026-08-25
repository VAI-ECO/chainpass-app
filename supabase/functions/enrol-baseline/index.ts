import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";
import { refuseUnpaid } from "../_shared/require-paid.ts";
import { getSetting, getSettingNumber } from "../_shared/settings.ts";
import { embedBothAndCompare, requireFaceService } from "../_shared/enrol-baseline.ts";

/**
 * POST /v1/enrol/baseline — CANON-CP-02 §1 step 10 face match against the step-5 baseline.
 * Two frames, gated on terms. FACE_SERVICE per frame; frame two compared to frame one.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const rejected = refusePlatformQuery(req);
  if (rejected) {
    return new Response(rejected.body, {
      status: rejected.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    const body = await req.json().catch(() => ({}));
    const session_id = typeof body.session_id === "string" ? body.session_id : "";
    if (!session_id) return json({ error: "session_id required" }, 400);
    if (body.vector !== undefined) {
      return json({ error: "client_vector_rejected — matcher is FACE_SERVICE, not a stub" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error } = await supabase
      .from("sessions")
      .select(
        "id, vai, held_capture, held_capture_voided_at, acceptance_capture, acceptance_capture_voided_at, enrolment_step, requirements_signed_at, terms_accepted_at, required_credential_level, platform_id, kyc_match_percent, paid_at, otp_verified_at"
      )
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    const unpaidBase = refuseUnpaid(session);
    if (unpaidBase) return json(unpaidBase, 403);
    if (!session.vai) return json({ error: "vai_required_first" }, 403);
    if (!session.otp_verified_at) {
      return json({ error: "otp_required_before_documents" }, 403);
    }
    if (!session.terms_accepted_at) {
      return json({ error: "terms_checkbox_required" }, 403);
    }
    if (!session.held_capture || session.held_capture_voided_at) {
      return json({ error: "held_capture_missing_or_voided" }, 409);
    }
    if (!session.acceptance_capture || session.acceptance_capture_voided_at) {
      return json({ error: "acceptance_capture_missing_or_voided" }, 409);
    }

    let level = session.required_credential_level as number | null;
    if (level == null && session.platform_id) {
      const { data: plat } = await supabase
        .from("platforms")
        .select("service_level")
        .eq("id", session.platform_id)
        .maybeSingle();
      level = plat?.service_level ?? null;
    }
    if (level === 3 && !session.requirements_signed_at) {
      return json({ error: "requirements_must_be_signed_before_baseline" }, 403);
    }

    let face: { url: string; key: string };
    try {
      face = requireFaceService();
    } catch (e) {
      return json(
        { error: e instanceof Error ? e.message : "FACE_SERVICE missing" },
        500
      );
    }

    const greenMin = await getSettingNumber(supabase, "band_green_min");
    const yellowMin = await getSettingNumber(supabase, "band_yellow_min");
    const compared = await embedBothAndCompare(
      face,
      session.held_capture,
      session.acceptance_capture,
      greenMin,
      yellowMin
    );
    const frameOne = compared.frameOne;
    const frameTwo = compared.frameTwo;
    const defaultModel = await getSetting(supabase, "engine_attempt_default");

    let is_trial = false;
    if (session.platform_id) {
      const { data: plat } = await supabase
        .from("platforms")
        .select("trial_mode")
        .eq("id", session.platform_id)
        .maybeSingle();
      is_trial = plat?.trial_mode === true;
    }

    const rows = [
      {
        vai: session.vai.trim(),
        vector: frameOne.vector,
        model: frameOne.model ?? defaultModel,
        model_version: frameOne.model_version ?? "1",
        engine: frameOne.model_checksum ?? null,
        is_trial,
        enrollment_score: 0,
        source: "in_house",
        photo_ref: "frame_one",
      },
      {
        vai: session.vai.trim(),
        vector: frameTwo.vector,
        model: frameTwo.model ?? defaultModel,
        model_version: frameTwo.model_version ?? "1",
        engine: frameTwo.model_checksum ?? null,
        is_trial,
        enrollment_score: 0,
        source: "in_house",
        photo_ref: "frame_two",
      },
    ];

    const { error: bErr } = await supabase.from("baselines").insert(rows);
    if (bErr) throw new Error(bErr.message);

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        enrolment_step: Math.max(session.enrolment_step ?? 1, 10),
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    return json({
      status: "baseline_committed",
      step: 10,
      frames_compared: compared.frames_compared,
      band: compared.band,
    });
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
