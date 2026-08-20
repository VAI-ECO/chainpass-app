import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";
import { getSetting } from "../_shared/settings.ts";

/**
 * POST /v1/enrol/baseline — §2.7 step 9.
 * Commit the held frame AFTER every required document is signed.
 * Body: { session_id, documents_signed: true, vector: number[], model, model_version }
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
    if (body.documents_signed !== true) {
      return json({ error: "documents_must_be_signed_before_baseline" }, 403);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error } = await supabase
      .from("sessions")
      .select("id, vai, held_capture, held_capture_voided_at, enrolment_step")
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    if (!session.vai) return json({ error: "vai_required_first" }, 403);
    if (!session.held_capture || session.held_capture_voided_at) {
      return json({ error: "held_capture_missing_or_voided" }, 409);
    }

    const vector = body.vector;
    if (!Array.isArray(vector) || vector.length !== 512) {
      return json({ error: "vector must be 512 floats from held frame" }, 400);
    }
    const model = typeof body.model === "string" ? body.model : await getSetting(supabase, "engine_attempt_default");
    const model_version =
      typeof body.model_version === "string" ? body.model_version : "1";

    // APPEND baseline — never delete. enrollment_score column is NOT NULL live;
    // §2.7 item 6 forbids residual score use — store 0, never return it.
    const { error: bErr } = await supabase.from("baselines").insert({
      vai: session.vai.trim(),
      vector,
      model,
      model_version,
      enrollment_score: 0,
      source: "in_house",
    });
    if (bErr) throw new Error(bErr.message);

    // Clear held capture after commit (committed into baselines)
    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        held_capture: null,
        enrolment_step: Math.max(session.enrolment_step, 9),
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    return json({ status: "baseline_committed", step: 9 });
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
