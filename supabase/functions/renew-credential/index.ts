import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { compareCaptureToBaseline } from "../_shared/band-compare.ts";
import { renewalPath } from "../_shared/renewal-path.ts";

/**
 * Renewal (§10.1 / §16.4):
 * - document_expiry AND next_complycube_date (provider retention) still live
 *   → in-house: fresh capture vs baseline, verified_at updated. No ComplyCube.
 * - either lapsed → full_verification_required (she re-runs provider live; §2.4b).
 * No stored client ID on either path.
 */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vai, capture } = await req.json();

    if (!vai) {
      return new Response(
        JSON.stringify({ error: "Missing required field: vai" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Renew] Processing renewal for V.A.I. ${vai}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: credential, error: credentialError } = await supabase
      .from("credentials")
      .select("vai, state, document_expiry, next_complycube_date")
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
          error: `Credential is ${credential.state}. Cannot renew.`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const path = renewalPath(
      credential.document_expiry,
      credential.next_complycube_date
    );

    console.log(
      `[Renew] path=${path} document_expiry=${credential.document_expiry} ` +
        `next_complycube_date=${credential.next_complycube_date}`
    );

    if (path === "full_verification_required") {
      // She must show up live at a camera and re-run the provider (§2.4b).
      // No stored client ID. No silent ComplyCube lookup.
      return new Response(
        JSON.stringify({
          vai,
          path: "full_verification_required",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!capture) {
      return new Response(
        JSON.stringify({
          vai,
          path: "in_house",
          action: "capture_required",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { band } = await compareCaptureToBaseline(supabase, vai, capture);

    if (band === "green") {
      const { error: updateError } = await supabase
        .from("credentials")
        .update({ verified_at: new Date().toISOString() })
        .eq("vai", vai);

      if (updateError) {
        throw new Error(`Failed to update verified_at: ${updateError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        vai,
        path: "in_house",
        band,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Renew] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
