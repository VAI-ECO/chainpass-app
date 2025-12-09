import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const MAX_ATTEMPTS = 5;

const getServiceClient = () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing Supabase credentials");
  return createClient(url, key);
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
    const { vai_number, otp_code } = await req.json();
    const normalized = vai_number?.trim().toUpperCase();

    if (!normalized || !otp_code) {
      return new Response(JSON.stringify({ error: "V.A.I. and OTP required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getServiceClient();

    const { data: request, error } = await supabase
      .from("recovery_requests")
      .select("*")
      .eq("vai_number", normalized)
      .in("status", ["otp_sent", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !request) {
      return new Response(JSON.stringify({ error: "No active recovery request" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (request.otp_attempts >= MAX_ATTEMPTS) {
      await supabase.from("recovery_requests").update({ status: "failed" }).eq("id", request.id);
      return new Response(JSON.stringify({ error: "Too many attempts" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (request.otp_expires_at && new Date(request.otp_expires_at) < new Date()) {
      await supabase.from("recovery_requests").update({ status: "expired" }).eq("id", request.id);
      return new Response(JSON.stringify({ error: "OTP expired" }), {
        status: 410,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (request.otp_code !== otp_code) {
      await supabase
        .from("recovery_requests")
        .update({ otp_attempts: request.otp_attempts + 1 })
        .eq("id", request.id);
      return new Response(JSON.stringify({ error: "Invalid OTP" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("recovery_requests")
      .update({
        otp_attempts: request.otp_attempts + 1,
        otp_verified_at: new Date().toISOString(),
        status: "otp_verified",
      })
      .eq("id", request.id);

    return new Response(JSON.stringify({ success: true, request_id: request.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[verify-recovery-otp] error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

