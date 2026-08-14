import { SupabaseClient } from "npm:@supabase/supabase-js@2";

interface FaceServiceResult {
  vector: number[];
  model: string;
  model_version: string;
  score: number;
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
 * Processes Frame B renewal: face check only (no new baseline)
 *
 * @param supabase - Supabase client
 * @param vai - V.A.I. number
 * @param capture - Base64-encoded JPEG capture
 * @returns Match result (true/false)
 */
export async function processFrameB(
  supabase: SupabaseClient,
  vai: string,
  capture: string
): Promise<boolean> {
  console.log(`[Frame B] Processing face check for V.A.I. ${vai}`);

  // Load newest baseline
  const { data: baselines, error: baselineError } = await supabase
    .from("baselines")
    .select("*")
    .eq("vai", vai)
    .order("created_at", { ascending: false })
    .limit(1);

  if (baselineError || !baselines || baselines.length === 0) {
    console.error(`[Frame B] No baseline found for V.A.I. ${vai}`);
    throw new Error("No baseline found for this V.A.I.");
  }

  const baseline = baselines[0];
  console.log(`[Frame B] Loaded baseline ID ${baseline.id}, enrollment_score=${baseline.enrollment_score}`);

  // Decode capture from base64 to bytes
  let base64Data = capture;
  if (capture.includes(",")) {
    base64Data = capture.split(",")[1];
  }

  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const captureBlob = bytes.buffer as ArrayBuffer;

  console.log(`[Frame B] Decoded ${captureBlob.byteLength} bytes from base64`);

  // Call face service
  const faceResult = await callFaceService(captureBlob);

  // Compare vectors using pgvector
  const FACE_MATCH_THRESHOLD = Deno.env.get("FACE_MATCH_THRESHOLD");
  if (!FACE_MATCH_THRESHOLD) {
    throw new Error("FACE_MATCH_THRESHOLD environment variable is not configured. Cannot proceed.");
  }

  const dropThreshold = parseFloat(FACE_MATCH_THRESHOLD);
  if (isNaN(dropThreshold)) {
    throw new Error(`FACE_MATCH_THRESHOLD must be a number, got: ${FACE_MATCH_THRESHOLD}`);
  }

  // Calculate cosine similarity
  const { data: similarityResult, error: similarityError } = await supabase
    .rpc("calculate_cosine_similarity", {
      baseline_vector: baseline.vector,
      capture_vector: JSON.stringify(faceResult.vector),
    });

  if (similarityError) {
    console.error(`[Frame B] Error calculating similarity:`, similarityError);
    throw new Error(`Failed to calculate vector similarity: ${similarityError.message}`);
  }

  const similarity = similarityResult as number;
  console.log(`[Frame B] Cosine similarity: ${similarity}`);

  // Threshold is RELATIVE to enrollment_score, not global
  const minAllowedSimilarity = baseline.enrollment_score - dropThreshold;
  const match = similarity >= minAllowedSimilarity;

  console.log(
    `[Frame B] enrollment_score=${baseline.enrollment_score}, ` +
    `drop_threshold=${dropThreshold}, min_allowed=${minAllowedSimilarity}, ` +
    `similarity=${similarity}, match=${match}`
  );

  // NO BASELINE WRITTEN
  // baselines is append-only, only Frame A writes to it

  return match;
}
