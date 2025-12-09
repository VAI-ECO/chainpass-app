import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const MIN_CONFIDENCE = 95;

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
    const { vai_number, facial_confidence } = await req.json();
    const normalized = vai_number?.trim().toUpperCase();

    if (!normalized || typeof facial_confidence !== "number") {
      return new Response(JSON.stringify({ error: "V.A.I. and confidence required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (facial_confidence < MIN_CONFIDENCE) {
      return new Response(JSON.stringify({ error: "Confidence below threshold" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getServiceClient();

    const { data: request, error } = await supabase
      .from("recovery_requests")
      .select("*")
      .eq("vai_number", normalized)
      .eq("status", "otp_verified")
      .order("otp_verified_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !request) {
      return new Response(JSON.stringify({ error: "No OTP-verified request found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("recovery_requests")
      .update({
        facial_verified: true,
        facial_confidence,
        facial_verified_at: new Date().toISOString(),
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    await supabase.from("vai_audit_log").insert({
      vai_number: normalized,
      action: "recovered",
      details: {
        request_id: request.id,
        method: request.recovery_method,
        confidence: facial_confidence,
      },
      performed_by: "system",
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[complete-vai-recovery] error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

