import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";
import { validateRegistrationFields } from "../_shared/enrol-register.ts";

/**
 * POST /v1/enrol/register — §2.3 step 4.
 * USERNAME · email · phone. NEVER legal name.
 * Fields from platform_agreements.collection_fields with at-least-one-of groups.
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
      .select("id, platform_id, biometric_consent_at, enrolment_step")
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    if (!session.biometric_consent_at) {
      return json({ error: "biometric_consent_required_first" }, 403);
    }

    const { data: pa } = await supabase
      .from("platform_agreements")
      .select("collection_fields")
      .eq("platform_id", session.platform_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const fields = validateRegistrationFields(body, pa?.collection_fields ?? null);

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        username: fields.username,
        contact_email: fields.email,
        contact_phone: fields.phone,
        enrolment_step: Math.max(session.enrolment_step, 4),
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    return json({ status: "registered", step: 4 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    const status = /legal_name|mandatory|at_least_one|forbidden|required field/i.test(message)
      ? 400
      : 500;
    return json({ error: message }, status);
  }
});

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
