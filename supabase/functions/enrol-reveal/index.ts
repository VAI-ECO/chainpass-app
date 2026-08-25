import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";
import { getSettingNumber, refuseUnset } from "../_shared/settings.ts";
import { refuseUnpaid } from "../_shared/require-paid.ts";

const VAI_ALPHABET = "ABCDEFGHJKLMNPQRTUVWXY23456789";

async function generateVAI(supabase: ReturnType<typeof createClient>): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const vai = Array.from({ length: 7 }, () => {
      const i = Math.floor(Math.random() * VAI_ALPHABET.length);
      return VAI_ALPHABET[i];
    }).join("");
    const { data } = await supabase.from("credentials").select("vai").eq("vai", vai).maybeSingle();
    if (!data) return vai;
  }
  throw new Error("failed to generate unique V.A.I.");
}

/**
 * POST /v1/enrol/reveal — CANON-CP-02 §1 step 8. V.A.I. minted and bound to the image.
 * Contact and OTP are step 9, after this.
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
    if (body.provider_passed !== true) {
      return json({ error: "provider_pass_required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error } = await supabase
      .from("sessions")
      .select(
        "id, platform_id, held_capture, vai, enrolment_step, background_check_at, document_expiry, issuing_country, issuing_province, payment_choice, paid_at, session_key"
      )
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    const unpaidReveal = refuseUnpaid(session);
    if (unpaidReveal) return json(unpaidReveal, 403);
    if (!session.held_capture) return json({ error: "held_capture_required" }, 403);
    if (!session.document_expiry) {
      return json({ error: "document_expiry_required" }, 403);
    }
    if (!session.issuing_country) {
      return json({ error: "issuing_country_required" }, 403);
    }
    if (session.vai) {
      return json({ status: "vai_already_revealed", vai: session.vai.trim(), step: 8 });
    }

    const { data: needsCheck } = await supabase
      .from("platform_requirements")
      .select("requirement_key")
      .eq("platform_id", session.platform_id)
      .eq("requirement_key", "background_check")
      .maybeSingle();
    if (needsCheck && !session.background_check_at) {
      return json({ error: "background_check_required", check_did_not_run: true }, 403);
    }

    const vai = await generateVAI(supabase);
    const yearStart = new Date();
    const termYears = await getSettingNumber(supabase, "credential_year_length_years") ?? refuseUnset("credential_year_length_years");
    const yearEnd = new Date(yearStart);
    yearEnd.setUTCFullYear(yearEnd.getUTCFullYear() + termYears);
    const retentionYears = await getSettingNumber(
      supabase,
      "provider_retention_years"
    ) ?? refuseUnset("provider_retention_years");
    const retentionEnd = new Date(yearStart);
    retentionEnd.setUTCFullYear(retentionEnd.getUTCFullYear() + retentionYears);

    // Origination = platform whose API key opened enrolment (token → session.platform_id).
    // Immutable via DB trigger (§2.8).
    const deferred = session.payment_choice === "defer";
    let deferral_expires_at: string | null = null;
    if (deferred) {
      const suspendAfterHours = await getSettingNumber(
        supabase,
        "deferral_suspend_after"
      ) ?? refuseUnset("deferral_suspend_after");
      deferral_expires_at = new Date(
        yearStart.getTime() + suspendAfterHours * 60 * 60 * 1000
      ).toISOString();
    }

    const { error: cErr } = await supabase.from("credentials").insert({
      vai,
      state: "active",
      credential_level: 1,
      originating_platform_id: session.platform_id,
      document_expiry: session.document_expiry,
      issuing_country: session.issuing_country,
      issuing_province: session.issuing_province,
      next_complycube_date: retentionEnd.toISOString().slice(0, 10),
      next_renewal_date: yearEnd.toISOString().slice(0, 10),
      year_starts_at: yearStart.toISOString(),
      year_ends_at: yearEnd.toISOString(),
      verified_at: yearStart.toISOString(),
      deferral_used: deferred,
      deferral_expires_at,
    });
    if (cErr) throw new Error(cErr.message);

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        vai,
        enrolment_step: Math.max(session.enrolment_step, 8),
        state: "processing",
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    if (session.session_key) {
      const { error: ckErr } = await supabase.from("credential_keys").insert({
        vai,
        session_key: session.session_key,
      });
      if (ckErr) throw new Error(ckErr.message);
    }

    if (needsCheck) {
      const { error: rcErr } = await supabase.from("requirement_completions").insert({
        vai,
        requirement_key: "background_check",
        platform_id: session.platform_id,
        signed_version: "ran",
        signed_at: session.background_check_at,
      });
      if (rcErr) throw new Error(rcErr.message);
    }

    // Origination commission to originator (session platform). House null → skip.
    const { accrueCommission } = await import("../_shared/commission.ts");
    await accrueCommission(supabase, {
      platform_id: session.platform_id,
      vai,
      event: "origination",
    });

    return json({ status: "vai_revealed", vai, step: 8 });
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
