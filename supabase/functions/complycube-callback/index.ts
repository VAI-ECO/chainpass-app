import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyWebhookSignature, parseWebhookPayload, getSignatureHeaderName } from "../_shared/complycube-webhook.ts";
import { processEnrollment } from "../_shared/enrollment-processor.ts";
import { emitEvent } from "../_shared/emit-event.ts";
import { extractKycDocumentFields } from "../_shared/kyc-document.ts";

const COMPLYCUBE_API_URL = "https://api.complycube.com/v1";

interface ComplyCubeData {
  clientId: string;
  livePhotoBlob: ArrayBuffer;
  documentExpiry: string;
}

interface FaceServiceResult {
  vector: number[];
  model: string;
  model_version: string;
  score: number;
}

/**
 * Fetch ComplyCube check data and live photo
 * Isolated boundary - fails loudly if env var missing
 */
async function fetchComplyCubeData(clientId: string): Promise<ComplyCubeData> {
  const COMPLYCUBE_API_KEY = Deno.env.get("COMPLYCUBE_API_KEY");
  if (!COMPLYCUBE_API_KEY) {
    throw new Error("COMPLYCUBE_API_KEY environment variable is not configured. Cannot proceed.");
  }

  console.log(`[ComplyCube] Fetching data for client ${clientId}`);

  // Fetch checks
  const checksResponse = await fetch(
    `${COMPLYCUBE_API_URL}/clients/${clientId}/checks`,
    {
      headers: { "Authorization": COMPLYCUBE_API_KEY },
    }
  );

  if (!checksResponse.ok) {
    const errorText = await checksResponse.text();
    throw new Error(`ComplyCube checks fetch failed: ${checksResponse.status} - ${errorText}`);
  }

  const checksData = await checksResponse.json();
  const latestCheck = checksData.items?.[0];

  if (!latestCheck) {
    throw new Error("No checks found for ComplyCube client");
  }

  // Expiry + issuing place. Never name, dob, address, or document number.
  const documentExpiry = extractKycDocumentFields(latestCheck).documentExpiry;

  console.log(`[ComplyCube] Document expiry: ${documentExpiry}`);

  // Fetch documents to get live photo
  const documentsResponse = await fetch(
    `${COMPLYCUBE_API_URL}/clients/${clientId}/documents`,
    {
      headers: { "Authorization": COMPLYCUBE_API_KEY },
    }
  );

  if (!documentsResponse.ok) {
    throw new Error("Failed to fetch documents from ComplyCube");
  }

  const documentsData = await documentsResponse.json();
  const livePhoto = documentsData.items?.find((doc: any) => doc.type === "live_photo");

  if (!livePhoto) {
    throw new Error("No live photo found in ComplyCube documents");
  }

  console.log(`[ComplyCube] Found live photo: ${livePhoto.id}`);

  // Download live photo
  const photoResponse = await fetch(
    `${COMPLYCUBE_API_URL}/documents/${livePhoto.id}/download`,
    {
      headers: { "Authorization": COMPLYCUBE_API_KEY },
    }
  );

  if (!photoResponse.ok) {
    throw new Error("Failed to download live photo from ComplyCube");
  }

  const livePhotoBlob = await photoResponse.arrayBuffer();
  console.log(`[ComplyCube] Downloaded live photo: ${livePhotoBlob.byteLength} bytes`);

  return {
    clientId,
    livePhotoBlob,
    documentExpiry,
  };
}

/**
 * Call face service to generate embedding vector
 * Isolated boundary - fails loudly if env vars missing
 */
async function callFaceService(imageBlob: ArrayBuffer): Promise<FaceServiceResult> {
  const FACE_SERVICE_URL = Deno.env.get("FACE_SERVICE_URL");
  const FACE_SERVICE_KEY = Deno.env.get("FACE_SERVICE_KEY");

  if (!FACE_SERVICE_URL) {
    throw new Error("FACE_SERVICE_URL environment variable is not configured. Cannot proceed.");
  }
  if (!FACE_SERVICE_KEY) {
    throw new Error("FACE_SERVICE_KEY environment variable is not configured. Cannot proceed.");
  }

  console.log("[Face Service] Generating embedding vector");

  const response = await fetch(FACE_SERVICE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${FACE_SERVICE_KEY}`,
      "Content-Type": "image/jpeg",
    },
    body: imageBlob,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Face service request failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  // Validate response structure
  if (!result.vector || !Array.isArray(result.vector) || result.vector.length !== 512) {
    throw new Error(`Face service returned invalid vector (expected 512 floats, got ${result.vector?.length || 0})`);
  }
  if (!result.model || !result.model_version || typeof result.score !== 'number') {
    throw new Error("Face service response missing required fields (model, model_version, score)");
  }

  console.log(`[Face Service] Vector generated: model=${result.model}, version=${result.model_version}, score=${result.score}`);

  return {
    vector: result.vector,
    model: result.model,
    model_version: result.model_version,
    score: result.score,
  };
}

/**
 * Store baseline photo in baseline-photos bucket
 * Returns opaque filename (no relationship to V.A.I.)
 */
async function storeBaselinePhoto(
  supabase: any,
  photoBlob: ArrayBuffer
): Promise<string> {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const filename = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');

  const { error: uploadError } = await supabase.storage
    .from("baseline-photos")
    .upload(filename, photoBlob, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to store baseline photo: ${uploadError.message}`);
  }

  console.log(`[Storage] Baseline photo stored: ${filename}`);
  return filename;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Verify webhook signature (FAIL CLOSED)
    const rawBody = await req.text();
    const signature = req.headers.get(getSignatureHeaderName());
    const webhookSecret = Deno.env.get("COMPLYCUBE_WEBHOOK_SECRET");

    await verifyWebhookSignature(rawBody, signature, webhookSecret);

    // Step 2: Parse webhook payload
    const webhook = parseWebhookPayload(rawBody);

    console.log(`[Callback] Processing webhook: status=${webhook.status}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 3: Find session by complycube_session_id
    let session;

    if (webhook.flowSessionId) {
      // Preferred: exact match by flow session ID
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("complycube_session_id", webhook.flowSessionId)
        .single();

      if (error || !data) {
        console.error(`[Callback] Session not found by flowSessionId: ${webhook.flowSessionId}`);
        return new Response(
          JSON.stringify({ error: "Session not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      session = data;
    } else if (webhook.clientId) {
      // Fallback: weaker guarantee, one client can have many sessions
      // Get the most recent session for this client
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("complycube_session_id", webhook.clientId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.error(`[Callback] Session not found by clientId: ${webhook.clientId}`);
        return new Response(
          JSON.stringify({ error: "Session not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      session = data;
    } else {
      throw new Error("No session identifier in webhook payload");
    }

    console.log(`[Callback] Session found: ${session.id}, route=${session.route}, state=${session.state}`);

    // Step 4: Idempotency - if already complete, return 200 and skip processing
    if (session.state === "complete") {
      console.log(`[Callback] Session already complete, skipping (idempotent replay)`);
      return new Response(
        JSON.stringify({ message: "Webhook already processed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 5: Route based on session.route
    const route = session.route as string;

    if (route === "enrollment") {
      // ENROLLMENT: Full onboarding - generate V.A.I., create credential
      console.log(`[Callback] Route: enrollment`);

      // Fetch ComplyCube data
      const complycubeData = await fetchComplyCubeData(webhook.clientId || session.complycube_session_id);

      // Generate face embedding
      const faceResult = await callFaceService(complycubeData.livePhotoBlob);

      // Hand to shared enrollment processor
      const enrollmentResult = await processEnrollment(supabase, {
        sessionId: session.id,
        complycubeClientId: complycubeData.clientId,
        livePhotoBlob: complycubeData.livePhotoBlob,
        documentExpiry: complycubeData.documentExpiry,
        faceVector: faceResult.vector,
        faceModel: faceResult.model,
        faceModelVersion: faceResult.model_version,
        enrollmentScore: faceResult.score,
      });

      console.log(`[Callback] Enrollment complete: V.A.I. ${enrollmentResult.vai}`);

      return new Response(
        JSON.stringify({ message: "Enrollment complete" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (route === "rebaseline") {
      // REBASELINE: New baseline after facial change, keep V.A.I.
      console.log(`[Callback] Route: rebaseline`);

      const vai = session.vai;
      if (!vai) {
        throw new Error("Session has no VAI (rebaseline requires existing credential)");
      }

      // Fetch ComplyCube data
      const complycubeData = await fetchComplyCubeData(webhook.clientId || session.complycube_session_id);

      // Generate face embedding
      const faceResult = await callFaceService(complycubeData.livePhotoBlob);

      // Store photo
      const photoRef = await storeBaselinePhoto(supabase, complycubeData.livePhotoBlob);

      // Append new baseline (baselines is append-only)
      const { error: baselinesError } = await supabase
        .from("baselines")
        .insert({
          vai: vai,
          vector: JSON.stringify(faceResult.vector),
          model: faceResult.model,
          model_version: faceResult.model_version,
          enrollment_score: faceResult.score,
          photo_ref: photoRef,
          source: "complycube",
        });

      if (baselinesError) {
        throw new Error(`Failed to insert baseline: ${baselinesError.message}`);
      }

      console.log(`[Callback] Baseline appended for V.A.I. ${vai}`);

      // Update session to complete
      await supabase
        .from("sessions")
        .update({ state: "complete" })
        .eq("id", session.id);

      // Emit rebaseline.complete event
      await emitEvent(supabase, vai, "rebaseline.complete");

      console.log(`[Callback] Rebaseline complete: V.A.I. ${vai}`);

      return new Response(
        JSON.stringify({ message: "Rebaseline complete" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (route === "locked") {
      // UNLOCK: Clear lock, no baseline written
      console.log(`[Callback] Route: locked (unlock)`);

      const vai = session.vai;
      if (!vai) {
        throw new Error("Session has no VAI (unlock requires existing credential)");
      }

      // Update credential state to active (clear lock)
      const { error: updateError } = await supabase
        .from("credentials")
        .update({ state: "active" })
        .eq("vai", vai);

      if (updateError) {
        throw new Error(`Failed to unlock credential: ${updateError.message}`);
      }

      console.log(`[Callback] Credential unlocked: V.A.I. ${vai}`);

      // Update session to complete
      await supabase
        .from("sessions")
        .update({ state: "complete" })
        .eq("id", session.id);

      // Emit unlock.complete event
      await emitEvent(supabase, vai, "unlock.complete");

      console.log(`[Callback] Unlock complete: V.A.I. ${vai}`);

      return new Response(
        JSON.stringify({ message: "Unlock complete" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (route === "renewal") {
      // RENEWAL: Append baseline, recompute dates, update document_expiry if needed
      console.log(`[Callback] Route: renewal`);

      const vai = session.vai;
      if (!vai) {
        throw new Error("Session has no VAI (renewal requires existing credential)");
      }

      // Load credential
      const { data: credential, error: credentialError } = await supabase
        .from("credentials")
        .select("*")
        .eq("vai", vai)
        .single();

      if (credentialError || !credential) {
        throw new Error("Credential not found");
      }

      // Fetch ComplyCube data
      const complycubeData = await fetchComplyCubeData(webhook.clientId || session.complycube_session_id);

      // Generate face embedding
      const faceResult = await callFaceService(complycubeData.livePhotoBlob);

      // Store photo
      const photoRef = await storeBaselinePhoto(supabase, complycubeData.livePhotoBlob);

      // Append new baseline
      const { error: baselinesError } = await supabase
        .from("baselines")
        .insert({
          vai: vai,
          vector: JSON.stringify(faceResult.vector),
          model: faceResult.model,
          model_version: faceResult.model_version,
          enrollment_score: faceResult.score,
          photo_ref: photoRef,
          source: "complycube",
        });

      if (baselinesError) {
        throw new Error(`Failed to insert baseline: ${baselinesError.message}`);
      }

      console.log(`[Callback] Baseline appended for renewal: V.A.I. ${vai}`);

      // Recompute dates
      const today = new Date().toISOString().split('T')[0];
      const { data: dates, error: datesError } = await supabase
        .rpc("set_credential_dates", {
          p_issued: today,
          p_document_expiry: complycubeData.documentExpiry,
        });

      if (datesError || !dates || dates.length === 0) {
        throw new Error(`Failed to calculate credential dates: ${datesError?.message || "No result"}`);
      }

      const { next_renewal, next_complycube } = dates[0];
      console.log(`[Callback] New dates - Renewal: ${next_renewal}, ComplyCube: ${next_complycube}`);

      // Update credential with new dates and document_expiry
      const { error: updateError } = await supabase
        .from("credentials")
        .update({
          next_renewal_date: next_renewal,
          next_complycube_date: next_complycube,
          document_expiry: complycubeData.documentExpiry,
        })
        .eq("vai", vai);

      if (updateError) {
        throw new Error(`Failed to update credential dates: ${updateError.message}`);
      }

      console.log(`[Callback] Credential dates updated: V.A.I. ${vai}`);

      // Update session to complete
      await supabase
        .from("sessions")
        .update({ state: "complete" })
        .eq("id", session.id);

      // Emit credential.renewed event
      await emitEvent(supabase, vai, "credential.renewed", {
        renewed_date: today,
        next_renewal_date: next_renewal,
      });

      console.log(`[Callback] Renewal complete: V.A.I. ${vai}`);

      return new Response(
        JSON.stringify({ message: "Renewal complete" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else {
      throw new Error(`Unknown session route: ${route}`);
    }

  } catch (error) {
    console.error("[Callback] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
