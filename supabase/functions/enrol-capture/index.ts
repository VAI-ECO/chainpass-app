import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";
import { voidHeldCaptureOnBreak, requireComplyCubeApiKey, assertEmbeddedProviderSession } from "../_shared/enrol-capture.ts";

/**
 * POST /v1/enrol/capture — §2.7 step 6.
 * ChainPass captures OWN frame from the same live camera session as the provider.
 * Held, not committed. Body: { session_id, capture, action?: "hold"|"void" }
 * No separate scan-your-face step.
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
    const action =
      body.action === "void"
        ? "void"
        : body.action === "open_provider"
          ? "open_provider"
          : "hold";
    if (!session_id) return json({ error: "session_id required" }, 400);

    try {
      assertEmbeddedProviderSession(body);
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "bad_request" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error } = await supabase
      .from("sessions")
      .select(
        "id, otp_verified_at, biometric_consent_at, enrolment_step, held_capture, username, contact_email, paid_at"
      )
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    if (!session.paid_at) {
      return json({ error: "pay_required_before_provider" }, 403);
    }
    if (!session.biometric_consent_at) {
      return json({ error: "biometric_consent_required_first" }, 403);
    }
    if (!session.otp_verified_at) {
      return json({ error: "otp_required_before_provider" }, 403);
    }

    if (action === "open_provider") {
      let apiKey: string;
      try {
        apiKey = requireComplyCubeApiKey();
      } catch (e) {
        return json(
          { error: e instanceof Error ? e.message : "COMPLYCUBE_API_KEY missing" },
          500
        );
      }

      const email =
        typeof session.contact_email === "string" && session.contact_email.trim()
          ? session.contact_email.trim()
          : session.username
            ? `${session.username.replace(/[^a-zA-Z0-9._-]/g, "")}@enrol.invalid`
            : `session-${session_id.slice(0, 8)}@enrol.invalid`;

      const clientResponse = await fetch("https://api.complycube.com/v1/clients", {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "person", email }),
      });
      if (!clientResponse.ok) {
        const errorText = await clientResponse.text();
        return json(
          {
            error: `ComplyCube client creation failed: ${clientResponse.status} - ${errorText}`,
          },
          500
        );
      }
      const clientData = await clientResponse.json();

      const tokenResponse = await fetch("https://api.complycube.com/v1/tokens", {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId: clientData.id, referrer: "*://*/*" }),
      });
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        return json(
          {
            error: `ComplyCube token failed: ${tokenResponse.status} - ${errorText}`,
          },
          500
        );
      }
      const tokenData = await tokenResponse.json();

      return json({
        status: "provider_open",
        step: 6,
        embed: true,
        redirect: false,
        token: tokenData.token,
        provider_session_key: clientData.id,
        committed: false,
      });
    }

    if (action === "void") {
      // §2.7 5a — break voids capture, not enrolment
      const patch = voidHeldCaptureOnBreak(session);
      const { error: uErr } = await supabase
        .from("sessions")
        .update(patch)
        .eq("id", session_id);
      if (uErr) throw new Error(uErr.message);
      return json({
        status: "capture_voided",
        enrolment_intact: !!session.username,
        step: 6,
      });
    }

    const capture = typeof body.capture === "string" ? body.capture : "";
    if (!capture) return json({ error: "capture required" }, 400);

    // Also accept provider_session_key on this same call (same camera session).
    const provider_session_key =
      typeof body.provider_session_key === "string"
        ? body.provider_session_key
        : null;

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        held_capture: capture,
        held_capture_voided_at: null,
        ...(provider_session_key
          ? { provider_session_key }
          : {}),
        enrolment_step: Math.max(session.enrolment_step, 6),
        state: "at_provider",
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    return json({ status: "capture_held", step: 6, committed: false });
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
