import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";

/**
 * POST /v1/enrol/otp — §2 step 5.
 * Control proven BEFORE any provider is paid.
 * Body: { session_id, otp_code } — verify against settings-backed store.
 * Pilot: accepts code matching settings.enrol_otp_test_code when set; else requires
 * sessions row already having a pending hash in a side table. For now: store
 * otp_verified_at when code equals settings key enrol_otp_accept (admin-set).
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
    const otp_code = typeof body.otp_code === "string" ? body.otp_code.trim() : "";
    if (!session_id) return json({ error: "session_id required" }, 400);
    if (!otp_code) return json({ error: "otp_code required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error } = await supabase
      .from("sessions")
      .select("id, username, contact_email, contact_phone, enrolment_step")
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    if (!session.username) return json({ error: "register_required_first" }, 403);

    // OTP value from settings — never a constant in code.
    const { data: setting, error: sErr } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "enrol_otp_accept")
      .maybeSingle();
    if (sErr) throw new Error(sErr.message);
    if (!setting?.value) {
      return json({ error: "settings.enrol_otp_accept is not configured" }, 500);
    }
    if (otp_code !== setting.value) {
      return json({ error: "otp_invalid" }, 401);
    }

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        otp_verified_at: new Date().toISOString(),
        enrolment_step: Math.max(session.enrolment_step, 5),
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    return json({ status: "otp_verified", step: 5 });
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
