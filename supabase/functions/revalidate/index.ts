import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { compareCaptureToBaseline } from "../_shared/band-compare.ts";

/**
 * Revalidate: V.A.I. + fresh capture → band (green | yellow | red).
 * No ComplyCube. No client ID. No external identity lookup.
 * The only lookup is face-against-vector (§2.4 patent gate / owner 20 Aug).
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vai, capture } = await req.json();

    if (!vai || !capture) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: vai, capture" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Revalidate] Face check for V.A.I. ${vai}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: credential, error: credentialError } = await supabase
      .from("credentials")
      .select("vai, state")
      .eq("vai", vai)
      .single();

    if (credentialError || !credential) {
      return new Response(
        JSON.stringify({ error: "Credential not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (credential.state === "suspended" || credential.state === "banned") {
      return new Response(
        JSON.stringify({
          error: `Credential is ${credential.state}. Cannot revalidate.`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { band } = await compareCaptureToBaseline(supabase, vai, capture);

    // Similarity stays at ChainPass. Platform receives only the band (§7).
    return new Response(
      JSON.stringify({ vai, band }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Revalidate] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
