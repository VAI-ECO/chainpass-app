import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";
import {
  step9Collects,
  validateRegistrationFields,
} from "../_shared/enrol-register.ts";
import { refuseUnpaid } from "../_shared/require-paid.ts";

/**
 * POST /v1/enrol/register — CANON-CP-02 §1 step 9.
 * After reveal. Contact from platforms.contact_spec. Floor: email or phone + T&C.
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
    const action = body.action === "spec" ? "spec" : "register";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error } = await supabase
      .from("sessions")
      .select(
        "id, platform_id, vai, biometric_consent_at, warning_acked_at, paid_at, payment_choice, enrolment_step"
      )
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    const unpaid = refuseUnpaid(session);
    if (unpaid) return json(unpaid, 403);
    if (!session.vai) {
      return json({ error: "enrolment_step_order: V.A.I. at 8 before contact at 9" }, 403);
    }
    if ((session.enrolment_step ?? 1) < 8) {
      return json({ error: "enrolment_step_order: V.A.I. at 8 before contact at 9" }, 403);
    }

    const { data: plat } = await supabase
      .from("platforms")
      .select("contact_spec, collection_fields")
      .eq("id", session.platform_id)
      .maybeSingle();

    const spec = (plat?.contact_spec ?? {}) as Record<string, unknown>;
    const fallback = (plat?.collection_fields ?? {}) as Record<string, unknown>;
    const collection = (
      Object.keys(spec).length > 0 ? spec : fallback
    ) as {
      required?: string[];
      groups?: Array<{ at_least_one_of: string[] }>;
    };

    const collect = step9Collects(collection);

    if (action === "spec") {
      return json({
        status: "spec",
        step: 9,
        collect,
        required: collection?.required ?? [],
        groups: collection?.groups ?? [],
        floor: ["email or phone", "terms and conditions"],
      });
    }

    const fields = validateRegistrationFields(body, collection);

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        username: fields.username,
        contact_email: fields.email,
        contact_phone: fields.phone,
        terms_accepted_at: new Date().toISOString(),
        enrolment_step: Math.max(session.enrolment_step, 9),
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    return json({ status: "registered", step: 9, collect });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    const status = /legal_name|mandatory|at_least_one|forbidden|required field|terms_and_conditions/i.test(
      message
    )
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
