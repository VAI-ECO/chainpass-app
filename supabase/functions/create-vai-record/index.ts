import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { randomBytes } from "https://deno.land/std@0.177.0/node/crypto.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSettingNumber, refuseUnset } from "../_shared/settings.ts";

const MAX_RETRIES = 10;

const getServiceClient = () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing Supabase credentials");
  return createClient(url, key);
};

const generateVaiNumber = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(7);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { session_id, complycube_check_id, biometric_hash, platform_source, referral_vai } =
      await req.json();

    if (!session_id || !complycube_check_id || !biometric_hash) {
      return new Response(JSON.stringify({ error: "Missing verification parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getServiceClient();

    const { data: session, error: sessionError } = await supabase
      .from("verification_sessions")
      .select("*")
      .eq("id", session_id)
      .maybeSingle();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Invalid or expired verification session" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existing } = await supabase
      .from("vai_records")
      .select("vai_number")
      .eq("biometric_hash", biometric_hash)
      .maybeSingle();

    if (existing?.vai_number) {
      return new Response(
        JSON.stringify({
          error: "Biometric already registered",
          existing_vai: existing.vai_number,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let vaiNumber: string | null = null;
    for (let i = 0; i < MAX_RETRIES; i++) {
      const candidate = generateVaiNumber();
      const { data: conflict } = await supabase
        .from("vai_records")
        .select("vai_number")
        .eq("vai_number", candidate)
        .maybeSingle();
      if (!conflict) {
        vaiNumber = candidate;
        break;
      }
    }

    if (!vaiNumber) {
      return new Response(JSON.stringify({ error: "Unable to generate unique V.A.I." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trialHours = await getSettingNumber(supabase, "deferral_window_hours") ?? refuseUnset("deferral_window_hours");
    const termYears = await getSettingNumber(supabase, "credential_year_length_years") ?? refuseUnset("credential_year_length_years");
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + termYears);
    const paymentDueAt = new Date(now.getTime() + trialHours * 60 * 60 * 1000).toISOString();

    const { data: vaiRecord, error: insertError } = await supabase
      .from("vai_records")
      .insert({
        vai_number: vaiNumber,
        biometric_hash,
        complycube_check_id,
        platform_source: platform_source || session.platform_source || "chainpass",
        status: "trial",
        verified_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_due_at: paymentDueAt,
        referral_vai: referral_vai || session.referral_vai || null,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("[create-vai-record] failed to insert", insertError);
      throw insertError;
    }

    await supabase
      .from("verification_sessions")
      .update({ status: "vai_issued", vai_number: vaiNumber })
      .eq("id", session_id);

    await supabase.from("vai_audit_log").insert({
      vai_number: vaiNumber,
      action: "created",
      details: {
        session_id,
        complycube_check_id,
        platform_source: platform_source || session.platform_source || "chainpass",
      },
      performed_by: "edge_function",
    });

    return new Response(
      JSON.stringify({
        success: true,
        vai_number: vaiRecord.vai_number,
        status: vaiRecord.status,
        payment_due_at: paymentDueAt,
        expires_at: expiresAt.toISOString(),
        trial_hours_remaining: trialHours,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[create-vai-record] error", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

