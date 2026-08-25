import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyEnrolmentToken } from "../_shared/enrolment-token.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";
import { getSettingNumber, refuseUnset } from "../_shared/settings.ts";

/**
 * POST /v1/enrol — open enrolment from a SIGNED TOKEN (§2.5).
 * Query ?platform=… is refused. Platform ID comes only from the token body.
 * Body: { enrolment_token, return_url }
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
    if (req.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405);
    }

    const body = await req.json().catch(() => ({}));
    const headerToken =
      req.headers.get("X-Enrolment-Token") ||
      req.headers.get("x-enrolment-token") ||
      "";
    const enrolment_token =
      typeof body.enrolment_token === "string" && body.enrolment_token
        ? body.enrolment_token
        : headerToken;
    const return_url =
      typeof body.return_url === "string" && body.return_url
        ? body.return_url
        : "https://chainpass.io/";

    if (!enrolment_token) {
      return json({ error: "enrolment_token required" }, 400);
    }

    const payload = await verifyEnrolmentToken(enrolment_token);
    const platform_id = payload.platform_id;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: plat, error } = await supabase
      .from("platforms")
      .select("id, status")
      .eq("id", platform_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!plat) return json({ error: "unknown_platform" }, 400);
    if (plat.status === "suspended" || plat.status === "disabled") {
      return json({ error: `platform is ${plat.status}` }, 403);
    }

    const sessionId = crypto.randomUUID();
    const sessionHours = await getSettingNumber(supabase, "enrol_session_hours") ?? refuseUnset("enrol_session_hours");
    const expires = new Date(
      Date.now() + sessionHours * 60 * 60 * 1000
    ).toISOString();

    const { error: sErr } = await supabase.from("sessions").insert({
      id: sessionId,
      platform_id,
      route: "enrollment",
      state: "open",
      return_url,
      expires_at: expires,
      enrolment_step: 1,
      frame: "A",
    });
    if (sErr) {
      return json({ error: `session open failed: ${sErr.message}` }, 500);
    }

    // Do not put platform_id in any URL the client would load (§2.5).
    return json({
      status: "enrolment_open",
      session_id: sessionId,
      step: 1,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const status = /token/i.test(message) ? 401 : 500;
    return json({ error: message }, status);
  }
});

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
