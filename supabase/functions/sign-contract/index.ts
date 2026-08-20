import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getSettingNumber } from "../_shared/settings.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Enrolment-window contract sign. Looks up verification_records by session_id —
 * not by complycube_client_id. Works before that column exists.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      vaiNumber,
      session_id,
      contractType,
      contractText,
      facialMatchConfidence,
    } = await req.json();

    console.log("[Sign Contract] Processing signature for VAI:", vaiNumber, "session:", session_id);

    if (!session_id) {
      throw new Error("session_id is required");
    }
    if (!contractType || !contractText || facialMatchConfidence === undefined) {
      throw new Error("Missing required fields");
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const minConfidence = await getSettingNumber(serviceClient, "band_green_min");
    // facialMatchConfidence historically 0–100; band settings are 0–1 similarity floors.
    const confidence01 =
      facialMatchConfidence > 1 ? facialMatchConfidence / 100 : facialMatchConfidence;

    if (confidence01 < minConfidence) {
      throw new Error("Facial match confidence too low to sign contract");
    }

    const { data: verificationRecord, error: verificationError } = await serviceClient
      .from("verification_records")
      .select("id")
      .eq("session_id", session_id)
      .single();

    if (verificationError || !verificationRecord) {
      console.error("[Sign Contract] Verification record not found:", verificationError);
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Verification record not found. Please complete identity verification first.",
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[Sign Contract] Verification record found:", verificationRecord.id);

    const contractDataString = `${vaiNumber}-${contractType}-${contractText}-${facialMatchConfidence}-${Date.now()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(contractDataString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const blockchainHash =
      "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const { data: contractData, error: contractError } = await serviceClient
      .from("signed_contracts")
      .insert({
        vai_number: vaiNumber,
        contract_type: contractType,
        contract_text: contractText,
        facial_match_confidence: facialMatchConfidence,
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        user_agent: req.headers.get("user-agent"),
        blockchain_hash: blockchainHash,
      })
      .select()
      .single();

    if (contractError) {
      console.error("[Sign Contract] Database error:", contractError);
      throw new Error("Failed to record contract signature");
    }

    return new Response(
      JSON.stringify({
        success: true,
        contractId: contractData.contract_id,
        signedAt: contractData.signed_at,
        blockchainHash,
        session_id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Sign Contract] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
