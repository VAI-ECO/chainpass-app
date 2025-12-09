import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

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
    const { vai_number } = await req.json();
    const normalized = vai_number?.trim().toUpperCase();

    if (!normalized || normalized.length !== 7) {
      return new Response(JSON.stringify({ error: "Valid V.A.I. number is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("vai_records")
      .select("vai_number, status, expires_at, locked_at")
      .eq("vai_number", normalized)
      .maybeSingle();

    if (error || !data) {
      return new Response(JSON.stringify({ error: "V.A.I. not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = Date.now();
    const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : null;
    let status = data.status;
    let remainingDays = null;

    if (expiresAt) {
      remainingDays = Math.max(0, Math.floor((expiresAt - now) / DAY_MS));
      if (expiresAt < now && status === "active") {
        status = "locked";
      }
    }

    return new Response(
      JSON.stringify({
        vai_number: data.vai_number,
        status,
        expires_at: data.expires_at,
        locked_at: data.locked_at,
        remaining_days: remainingDays,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[check-vai-status] error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

