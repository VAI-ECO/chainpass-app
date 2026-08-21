import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";
import {
  assertWarningBeforePay,
  buildPayQuote,
} from "../_shared/enrol-pay.ts";

/**
 * POST /v1/enrol/pay — §2 step 3 PAY (before provider).
 * §2.1 warning+consent must already be at step 2.
 * Figures from settings / platform_agreements — never literals (§1.1a).
 * Body: { session_id, choice: "pay" | "defer" }
 * GET-style quote: { session_id, quote_only: true }
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
        "id, platform_id, enrolment_step, warning_acked_at, biometric_consent_at, paid_at, payment_choice"
      )
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);

    try {
      assertWarningBeforePay(session);
    } catch (e) {
      return json(
        { error: e instanceof Error ? e.message : "warning_required" },
        403
      );
    }

    const quote = await buildPayQuote(supabase, session.platform_id);

    if (body.quote_only === true) {
      return json({ status: "pay_quote", step: 3, quote });
    }

    const choice = body.choice === "defer" ? "defer" : body.choice === "pay" ? "pay" : "";
    if (!choice) return json({ error: "choice must be pay or defer" }, 400);

    if (choice === "defer") {
      if (!quote.deferral) {
        return json({ error: "deferral_not_offered_by_platform" }, 400);
      }
    }

    const price_charged =
      choice === "defer" ? "0" : String(quote.price);

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        paid_at: new Date().toISOString(),
        payment_choice: choice,
        price_charged,
        required_credential_level: quote.required_credential_level,
        enrolment_step: Math.max(session.enrolment_step ?? 1, 3),
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    return json({
      status: choice === "defer" ? "deferred" : "paid",
      step: 3,
      quote,
      payment_choice: choice,
      price_charged,
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
