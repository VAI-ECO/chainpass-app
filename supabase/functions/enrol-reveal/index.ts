import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";

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
 * POST /v1/enrol/reveal — §2 step 7.
 * V.A.I. revealed on provider pass; origination stamped (immutable via trigger).
 * Body: { session_id, provider_passed: true }
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
      .select("id, platform_id, held_capture, otp_verified_at, vai, enrolment_step")
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    if (!session.otp_verified_at) return json({ error: "otp_required" }, 403);
    if (!session.held_capture) return json({ error: "held_capture_required" }, 403);
    if (session.vai) {
      return json({ status: "vai_already_revealed", vai: session.vai.trim(), step: 7 });
    }

    const vai = await generateVAI(supabase);
    const yearStart = new Date();
    const yearEnd = new Date(yearStart);
    yearEnd.setUTCFullYear(yearEnd.getUTCFullYear() + 1);

    // Origination = platform whose API key opened enrolment (token → session.platform_id).
    // Immutable via DB trigger (§2.8).
    const { error: cErr } = await supabase.from("credentials").insert({
      vai,
      state: "active",
      credential_level: 1,
      originating_platform_id: session.platform_id,
      next_renewal_date: yearEnd.toISOString().slice(0, 10),
      year_starts_at: yearStart.toISOString(),
      year_ends_at: yearEnd.toISOString(),
      verified_at: yearStart.toISOString(),
    });
    if (cErr) throw new Error(cErr.message);

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        vai,
        enrolment_step: Math.max(session.enrolment_step, 7),
        state: "processing",
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    return json({ status: "vai_revealed", vai, step: 7 });
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
