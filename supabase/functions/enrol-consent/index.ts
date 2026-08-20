import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";

/**
 * POST /v1/enrol/consent — §2.6 step 2.
 * Biometric consent BEFORE any capture. Three layers mandatory:
 * 1) ChainPass↔platform (onboarding — already on platform_agreements)
 * 2) ChainPass↔holder (this call)
 * 3) Platform↔holder (first-visit terms — gate, not here)
 * Body: { session_id, consent_biometric: true }
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
    if (body.consent_biometric !== true) {
      return json({ error: "biometric_consent_required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error } = await supabase
      .from("sessions")
      .select("id, enrolment_step, held_capture")
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    if (session.held_capture) {
      return json({ error: "capture_already_exists_consent_too_late" }, 409);
    }

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        biometric_consent_at: new Date().toISOString(),
        enrolment_step: Math.max(session.enrolment_step, 2),
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    return json({ status: "consent_recorded", step: 2 });
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
