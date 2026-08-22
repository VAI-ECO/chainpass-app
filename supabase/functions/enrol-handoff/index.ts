import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";

/**
 * POST /v1/enrol/handoff — §2.4 / §2.4a / §2.9 step 11.
 * Browser payload: V.A.I. + username + email/phone only. session_key is nulled, never shown.
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error } = await supabase
      .from("sessions")
      .select(
        "id, vai, username, contact_email, contact_phone, provider_session_key, enrolment_step, platform_id, return_url, state"
      )
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    if (!session.vai) return json({ error: "vai_required" }, 403);
    if (session.enrolment_step < 10) {
      return json({ error: "congratulations_required_before_handoff" }, 403);
    }
    if (session.enrolment_step >= 11 || session.state === "complete") {
      return json({ status: "no_longer_held", step: 11, session_key: null }, 410);
    }

    const payload = {
      vai: session.vai.trim(),
      username: session.username,
      email: session.contact_email,
      phone: session.contact_phone,
    };

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        provider_session_key: null,
        enrolment_step: 11,
        state: "complete",
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    const { error: kErr } = await supabase
      .from("credential_keys")
      .update({
        session_key: null,
        superseded_at: new Date().toISOString(),
      })
      .eq("vai", session.vai.trim());
    if (kErr) throw new Error(kErr.message);

    return json({
      status: "handed_off",
      step: 11,
      payload,
      session_key: null,
      return_url: session.return_url,
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
