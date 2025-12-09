import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

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
    const { biometric_hash, dob_day, sex } = await req.json();

    if (!biometric_hash) {
      return new Response(
        JSON.stringify({ error: "biometric_hash is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = getServiceClient();

    let query = supabase
      .from("person_identity_signatures")
      .select("person_id")
      .eq("biometric_hash", biometric_hash);

    if (dob_day) {
      query = query.eq("dob_day", dob_day);
    }
    if (sex) {
      query = query.eq("sex", sex);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("[check-vai-duplicate] error", error);
      throw error;
    }

    if (!data) {
      return new Response(JSON.stringify({ duplicate: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: person } = await supabase
      .from("person_profiles")
      .select("current_vai_number")
      .eq("id", data.person_id)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        duplicate: true,
        existing_vai: person?.current_vai_number ?? null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[check-vai-duplicate] error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

