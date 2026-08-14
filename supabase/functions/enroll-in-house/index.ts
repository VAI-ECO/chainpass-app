import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { emitEvent } from "../_shared/emit-event.ts";

const VAI_ALPHABET = "ABCDEFGHJKLMNPQRTUVWXY23456789"; // A-Z, 2-9, excluding I, O, S, Z
const MAX_VAI_ATTEMPTS = 10;

interface FaceServiceResult {
  vector: number[];
  model: string;
  model_version: string;
  score: number;
}

/**
 * Call face service to generate embedding vector
 * Isolated boundary - fails loudly if env vars missing
 * Reused from generate-baseline
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
 * Generate a unique 7-character V.A.I.
 * Alphabet: A-Z and 2-9, excluding I, O, S, Z
 * Reused from generate-baseline
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
 * Reused from generate-baseline
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

/**
 * Check if this face already exists in the system
 * Returns true if duplicate detected, false if unique
 *
 * CRITICAL: This is the ONLY duplicate defense during soft launch.
 * ComplyCube's enrolled-faces check is unavailable, so vector comparison
 * carries "one person, one V.A.I." alone.
 */
async function checkForDuplicate(
  supabase: any,
  captureVector: number[],
  threshold: number
): Promise<boolean> {
  console.log(`[Duplicate Check] Comparing against all baselines with threshold ${threshold}`);

  // Fetch ALL baselines
  const { data: baselines, error: baselinesError } = await supabase
    .from("baselines")
    .select("id, vai, vector, enrollment_score");

  if (baselinesError) {
    throw new Error(`Failed to fetch baselines: ${baselinesError.message}`);
  }

  if (!baselines || baselines.length === 0) {
    console.log("[Duplicate Check] No baselines to compare against");
    return false; // No baselines means no duplicates
  }

  console.log(`[Duplicate Check] Comparing against ${baselines.length} baseline(s)`);

  // Compare against each baseline
  for (const baseline of baselines) {
    const { data: similarity, error: similarityError } = await supabase
      .rpc("calculate_cosine_similarity", {
        baseline_vector: baseline.vector,
        capture_vector: JSON.stringify(captureVector),
      });

    if (similarityError) {
      console.error(`[Duplicate Check] Error calculating similarity for baseline ${baseline.id}:`, similarityError);
      throw new Error(`Failed to calculate similarity: ${similarityError.message}`);
    }

    const score = similarity as number;
    // Log EVERY score - the full distribution is needed to calibrate the threshold
    console.log(`[Duplicate Check] Baseline ${baseline.id} (V.A.I. ${baseline.vai}): similarity=${score}, threshold=${threshold}`);

    // Duplicate detected
    if (score >= threshold) {
      console.error(`[Duplicate Check] DUPLICATE DETECTED: similarity=${score}, baseline=${baseline.id}, threshold=${threshold}`);
      return true;
    }
  }

  console.log("[Duplicate Check] No duplicates found");
  return false;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { capture, platform_id } = await req.json();

    if (!capture || !platform_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: capture and platform_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[In-House Enrollment] Starting for platform: ${platform_id}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 1: Decode capture from base64 to bytes
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    let base64Data = capture;
    if (capture.includes(",")) {
      base64Data = capture.split(",")[1];
    }

    // Decode base64 to bytes
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const captureBlob = bytes.buffer as ArrayBuffer;

    console.log(`[Capture] Decoded ${captureBlob.byteLength} bytes from base64`);

    // Step 2: Call face service
    const faceResult = await callFaceService(captureBlob);

    // IMPORTANT: No "sealed room" logic here. ComplyCube is not involved.
    // The score is just a score. We record it as-is.
    console.log(`[Enrollment Score] ${faceResult.score} (recorded as-is, not personal 100%)`);

    // Step 3: Duplicate detection - THE ONLY DEFENSE during soft launch
    // SECURITY: Only trust the vector from face service, nothing from request body

    // Fail loudly if env vars are missing - no defaults, no guesses
    const duplicateThresholdStr = Deno.env.get("DUPLICATE_THRESHOLD");
    if (!duplicateThresholdStr) {
      throw new Error("DUPLICATE_THRESHOLD environment variable is not configured. Cannot proceed.");
    }

    const duplicateEnforceStr = Deno.env.get("DUPLICATE_ENFORCE");
    if (!duplicateEnforceStr) {
      throw new Error("DUPLICATE_ENFORCE environment variable is not configured. Cannot proceed.");
    }

    const duplicateThreshold = parseFloat(duplicateThresholdStr);
    if (isNaN(duplicateThreshold)) {
      throw new Error(`DUPLICATE_THRESHOLD must be a number, got: ${duplicateThresholdStr}`);
    }

    const duplicateEnforce = duplicateEnforceStr.toLowerCase() === "true";
    console.log(`[Duplicate Check] DUPLICATE_ENFORCE=${duplicateEnforce} (observe mode=${!duplicateEnforce})`);

    // ALWAYS run the duplicate check to log the full distribution
    const isDuplicate = await checkForDuplicate(supabase, faceResult.vector, duplicateThreshold);

    // OBSERVE MODE: when enforce=false, log but refuse nothing
    // The soft launch exists to produce the data that measures the threshold
    if (isDuplicate && duplicateEnforce) {
      console.error("[In-House Enrollment] Duplicate face detected - refusing enrollment (DUPLICATE_ENFORCE=true)");
      return new Response(
        JSON.stringify({
          error: "This face is already enrolled",
          duplicate: true
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (isDuplicate && !duplicateEnforce) {
      console.warn("[In-House Enrollment] Duplicate face detected - ALLOWING enrollment (DUPLICATE_ENFORCE=false, observe mode)");
    }

    // Step 4: Store photo
    const photoRef = await storeBaselinePhoto(supabase, captureBlob);

    // Step 5: Generate V.A.I.
    const vai = await generateVAI(supabase);

    // Step 6: Insert credentials (provisional, no ComplyCube data)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const { error: credentialsError } = await supabase
      .from("credentials")
      .insert({
        vai: vai,
        state: "active",
        provisional: true,
        complycube_client_id: null,
        document_expiry: null,
        next_renewal_date: null, // No renewal for provisional credentials
        next_complycube_date: null,
        screening_state: "pending", // No screening ran
      });

    if (credentialsError) {
      throw new Error(`Failed to insert credentials: ${credentialsError.message}`);
    }

    console.log(`[Credentials] Inserted: ${vai} (provisional=true)`);

    // Step 7: Insert baselines
    const { error: baselinesError } = await supabase
      .from("baselines")
      .insert({
        vai: vai,
        vector: JSON.stringify(faceResult.vector), // pgvector expects array as JSON string
        model: faceResult.model,
        model_version: faceResult.model_version,
        enrollment_score: faceResult.score, // Record actual score, not "personal 100%"
        photo_ref: photoRef,
        source: "in_house",
      });

    if (baselinesError) {
      throw new Error(`Failed to insert baseline: ${baselinesError.message}`);
    }

    console.log(`[Baselines] Inserted: source=in_house, score=${faceResult.score}`);

    // Step 8: Insert credential_platforms
    const { error: platformLinkError } = await supabase
      .from("credential_platforms")
      .insert({
        vai: vai,
        platform_id: platform_id,
        state: "active",
      });

    if (platformLinkError) {
      throw new Error(`Failed to insert credential_platforms: ${platformLinkError.message}`);
    }

    console.log(`[Platform Link] Inserted: vai=${vai}, platform=${platform_id}`);

    // Step 9: Emit credential.issued event
    await emitEvent(supabase, vai, "credential.issued", {
      issued_date: today,
    });

    console.log(`[Event] Emitted credential.issued for ${vai}`);

    // Step 10: Return success
    return new Response(
      JSON.stringify({
        vai: vai,
        enrollment_score: faceResult.score,
        duplicate_check_enforced: duplicateEnforce, // false = observe mode, true = enforcement active
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[In-House Enrollment] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
