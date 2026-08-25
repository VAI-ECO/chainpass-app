import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";
import { refuseUnpaid } from "../_shared/require-paid.ts";
import { getSettingNumber } from "../_shared/settings.ts";

/**
 * POST /v1/enrol/complete — §2 step 11 congratulations.
 * After baseline committed (step 10); before account security (step 12).
 * Body: { session_id }
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
      .select("id, vai, enrolment_step, requirements_signed_at, paid_at")
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    const unpaidComplete = refuseUnpaid(session);
    if (unpaidComplete) return json(unpaidComplete, 403);
    if (!session.vai) return json({ error: "vai_required" }, 403);
    if ((session.enrolment_step ?? 1) < 10) {
      return json({ error: "baseline_must_be_committed_first" }, 403);
    }

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        congratulations_at: new Date().toISOString(),
        enrolment_step: Math.max(session.enrolment_step, 11),
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    const term_years = await getSettingNumber(
      supabase,
      "credential_year_length_years"
    );

    return json({
      status: "congratulations",
      step: 11,
      vai: session.vai.trim(),
      term_years,
      term_setting: "credential_year_length_years",
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
