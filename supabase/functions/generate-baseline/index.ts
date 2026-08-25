import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { extractKycDocumentFields } from "../_shared/kyc-document.ts";

const COMPLYCUBE_API_URL = "https://api.complycube.com/v1";
const VAI_ALPHABET = "ABCDEFGHJKLMNPQRTUVWXY23456789"; // A-Z, 2-9, excluding I, O, S, Z
const MAX_VAI_ATTEMPTS = 10;

interface ComplyCubeResult {
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
 * Call ComplyCube API to fetch check results and live photo
 * Isolated boundary - fails loudly if env var missing
 */
async function callComplyCube(sessionId: string): Promise<ComplyCubeResult> {
  const COMPLYCUBE_API_KEY = Deno.env.get("COMPLYCUBE_API_KEY");
  if (!COMPLYCUBE_API_KEY) {
    throw new Error("COMPLYCUBE_API_KEY environment variable is not configured. Cannot proceed.");
  }

  console.log(`[ComplyCube] Fetching data for session: ${sessionId}`);

  // Get the client ID from the session (stored as complycube_session_id)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("complycube_session_id")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session?.complycube_session_id) {
    throw new Error("Session has no ComplyCube session ID");
  }

  const clientId = session.complycube_session_id;

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

  console.log(`[Face Service] Generating embedding vector`);

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
 * Generate a unique 7-character V.A.I.
 * Alphabet: A-Z and 2-9, excluding I, O, S, Z
 */
async function generateVAI(supabase: any): Promise<string> {
  for (let attempt = 0; attempt < MAX_VAI_ATTEMPTS; attempt++) {
    // Generate random 7-character string
    const vai = Array.from({ length: 7 }, () => {
      const randomIndex = Math.floor(Math.random() * VAI_ALPHABET.length);
      return VAI_ALPHABET[randomIndex];
    }).join("");

    // Check for collision
    const { data, error } = await supabase
      .from("credentials")
      .select("vai")
      .eq("vai", vai)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to check V.A.I. uniqueness: ${error.message}`);
    }

    if (!data) {
      console.log(`[V.A.I.] Generated: ${vai}`);
      return vai;
    }

    console.log(`[V.A.I.] Collision detected: ${vai}, retrying...`);
  }

  throw new Error(`Failed to generate unique V.A.I. after ${MAX_VAI_ATTEMPTS} attempts`);
}

/**
 * Store baseline photo in baseline-photos bucket
 *
 * IMPORTANT: Application-level encryption of baseline photos is NOT implemented.
 * This is an open decision requiring a key management approach that does not
 * store the key beside the data. Current implementation relies on:
 * - Supabase storage server-side encryption at rest
 * - Private bucket with no public access policy
 * - Random opaque filenames with no relationship to V.A.I.
 */
async function storeBaselinePhoto(
  supabase: any,
  photoBlob: ArrayBuffer
): Promise<string> {
  // Generate random opaque filename with no relationship to V.A.I.
  // The database row points to the file; the file must point to nothing.
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const filename = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');

  const { error: uploadError } = await supabase.storage
    .from("baseline-photos")
    .upload(filename, photoBlob, {
      contentType: "image/jpeg",
      upsert: false, // Should never collide with random 128-bit filename
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
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "session_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Generate Baseline] Starting for session: ${session_id}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 1: Load and validate session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (session.route !== "enrollment") {
      return new Response(
        JSON.stringify({ error: `Invalid session route: expected 'enrollment', got '${session.route}'` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (session.state !== "processing") {
      return new Response(
        JSON.stringify({ error: `Invalid session state: expected 'processing', got '${session.state}'` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Session] Valid: route=${session.route}, state=${session.state}`);

    // Step 2: Fetch ComplyCube data
    const complycubeResult = await callComplyCube(session_id);

    // Step 3: Generate face embedding
    const faceResult = await callFaceService(complycubeResult.livePhotoBlob);

    // THE SEALED ROOM: ComplyCube already verified this person IS the person.
    // Whatever score we get here IS their personal 100%. We NEVER reject on low score.
    // A low score just means a bad photograph. Store it and move on.
    console.log(`[Sealed Room] Enrollment score: ${faceResult.score} (no threshold, never reject)`);

    // Step 4: Generate V.A.I.
    const vai = await generateVAI(supabase);

    // Step 5: Store baseline photo
    const photoRef = await storeBaselinePhoto(supabase, complycubeResult.livePhotoBlob);

    // Step 6: Get credential dates using set_credential_dates function
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const { data: dates, error: datesError } = await supabase
      .rpc("set_credential_dates", {
        p_issued: today,
        p_document_expiry: complycubeResult.documentExpiry,
      });

    if (datesError || !dates || dates.length === 0) {
      throw new Error(`Failed to calculate credential dates: ${datesError?.message || "No result"}`);
    }

    const { next_renewal, next_complycube } = dates[0];
    console.log(`[Dates] Renewal: ${next_renewal}, ComplyCube: ${next_complycube}`);

    // Step 7: Insert credentials
    const { error: credentialsError } = await supabase
      .from("credentials")
      .insert({
        vai: vai,
        state: "active",
        // Provider client id is not stored — live enrolment only (§2.4).
        document_expiry: complycubeResult.documentExpiry,
        next_renewal_date: next_renewal,
        next_complycube_date: next_complycube,
        screening_state: "pending",
      });

    if (credentialsError) {
      throw new Error(`Failed to insert credentials: ${credentialsError.message}`);
    }

    console.log(`[Credentials] Inserted: ${vai}`);

    // Step 8: Insert baselines (append-only, never update/delete)
    const { error: baselinesError } = await supabase
      .from("baselines")
      .insert({
        vai: vai,
        vector: JSON.stringify(faceResult.vector), // pgvector expects array as JSON string
        model: faceResult.model,
        model_version: faceResult.model_version,
        enrollment_score: faceResult.score,
        photo_ref: photoRef,
        source: "complycube",
      });

    if (baselinesError) {
      throw new Error(`Failed to insert baseline: ${baselinesError.message}`);
    }

    console.log(`[Baselines] Inserted: vector=${faceResult.vector.length} floats, score=${faceResult.score}`);

    // Step 9: Update session to complete
    const { error: updateError } = await supabase
      .from("sessions")
      .update({
        state: "complete",
        vai: vai,
      })
      .eq("id", session_id);

    if (updateError) {
      throw new Error(`Failed to update session: ${updateError.message}`);
    }

    console.log(`[Session] Updated to complete with V.A.I.: ${vai}`);

    // Step 10: Return success
    return new Response(
      JSON.stringify({
        vai: vai,
        enrollment_score: faceResult.score,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Generate Baseline] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
