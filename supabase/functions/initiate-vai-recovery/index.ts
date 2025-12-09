import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const OTP_TTL_MINUTES = 10;

const getServiceClient = () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing Supabase credentials");
  return createClient(url, key);
};

const mask = (value: string, type: "phone" | "email") => {
  if (type === "phone") return value.replace(/\d(?=\d{2})/g, "*");
  const [local, domain] = value.split("@");
  if (!domain) return "***";
  const short = local.length > 2 ? `${local[0]}***${local.slice(-1)}` : `${local}***`;
  return `${short}@${domain}`;
};

const randomOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

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
    const { vai_number, method } = await req.json();
    const normalized = vai_number?.trim().toUpperCase();

    if (!normalized || normalized.length !== 7 || (method !== "phone" && method !== "email")) {
      return new Response(JSON.stringify({ error: "Invalid recovery request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getServiceClient();

    const { data: record } = await supabase
      .from("vai_records")
      .select("vai_number, phone, email")
      .eq("vai_number", normalized)
      .maybeSingle();

    if (!record) {
      return new Response(JSON.stringify({ error: "V.A.I. not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const destination = method === "phone" ? record.phone : record.email;
    if (!destination) {
      return new Response(JSON.stringify({ error: `No ${method} on file` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const otp = randomOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    const { data: request, error } = await supabase
      .from("recovery_requests")
      .insert({
        vai_number: normalized,
        recovery_method: method,
        recovery_destination: destination,
        otp_code: otp,
        otp_expires_at: expiresAt,
        status: "otp_sent",
      })
      .select("id")
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        request_id: request.id,
        destination_hint: mask(destination, method),
        method,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[initiate-vai-recovery] error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

