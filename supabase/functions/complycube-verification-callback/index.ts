import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Enrolment-window callback. DB row is keyed by session_id — not complycube_client_id.
 * clientId is session-scoped for the live provider fetch only (person at camera).
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("═══ Provider Callback Processing START ═══");

    const { session_id, clientId } = await req.json();

    if (!session_id) {
      throw new Error("session_id is required");
    }
    if (!clientId) {
      throw new Error("clientId is required for the live provider fetch in the enrolment window");
    }

    console.log("Processing session:", session_id, "live client:", clientId);

    const COMPLYCUBE_API_KEY = Deno.env.get("COMPLYCUBE_API_KEY");

    const checksResponse = await fetch(
      `https://api.complycube.com/v1/clients/${clientId}/checks`,
      { headers: { Authorization: COMPLYCUBE_API_KEY! } }
    );

    if (!checksResponse.ok) {
      const error = await checksResponse.text();
      throw new Error(`Failed to fetch checks: ${error}`);
    }

    const checksData = await checksResponse.json();
    const latestCheck = checksData.items?.[0];

    if (!latestCheck) {
      return new Response(
        JSON.stringify({
          success: false,
          status: "processing",
          message: "Verification still in progress",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (latestCheck.status !== "complete") {
      return new Response(
        JSON.stringify({
          success: false,
          status: "processing",
          message: "Verification not yet complete",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const documentsResponse = await fetch(
      `https://api.complycube.com/v1/clients/${clientId}/documents`,
      { headers: { Authorization: COMPLYCUBE_API_KEY! } }
    );

    if (!documentsResponse.ok) {
      throw new Error("Failed to fetch documents");
    }

    const documentsData = await documentsResponse.json();
    const livePhoto = documentsData.items?.find(
      (doc: { type: string; status: string }) =>
        doc.type === "live_photo" && doc.status === "approved"
    );

    if (!livePhoto) {
      throw new Error("No approved live photo found");
    }

    const photoResponse = await fetch(
      `https://api.complycube.com/v1/documents/${livePhoto.id}/download`,
      { headers: { Authorization: COMPLYCUBE_API_KEY! } }
    );

    if (!photoResponse.ok) {
      throw new Error("Failed to download photo");
    }

    const photoBlob = await photoResponse.arrayBuffer();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const fileName = `${session_id}-provider-biometric.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("verification-photos")
      .upload(fileName, photoBlob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload photo: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("verification-photos").getPublicUrl(fileName);

    // Re-keyed: verification_records by enrolment session_id — column may not exist.
    const { data: updated, error: updateError } = await supabase
      .from("verification_records")
      .update({
        complycube_verification_id: latestCheck.id,
        verification_status: latestCheck.outcome,
        biometric_confirmed: latestCheck.outcome === "clear",
        selfie_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", session_id)
      .select("id")
      .maybeSingle();

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }
    if (!updated) {
      throw new Error(`No verification_records row for session_id=${session_id}`);
    }

    console.log("✓ Database updated for session", session_id);
    console.log("═══ Provider Callback Processing SUCCESS ═══");

    return new Response(
      JSON.stringify({
        success: true,
        outcome: latestCheck.outcome,
        transactionId: latestCheck.id,
        biometricUrl: publicUrl,
        verified: latestCheck.outcome === "clear",
        session_id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("═══ Provider Callback Processing FAILED ═══");
    console.error("Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
