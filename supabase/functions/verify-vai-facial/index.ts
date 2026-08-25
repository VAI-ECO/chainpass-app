import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { getSettingNumber } from "../_shared/settings.ts";
import { resolveAttemptEngine } from "../_shared/attempt-engine.ts";
import { bandFromSimilarity } from "../_shared/band-compare.ts";
import { recordRedAndResolve } from "../_shared/reds-threshold.ts";
import {
  internalFromBand,
  parseResponseLevel,
  shapePublicResponse,
} from "../_shared/response-level.ts";

interface FaceServiceResult {
  vector: number[];
  model: string;
  model_version: string;
  score: number;
}

/**
 * Hash a service key using SHA-256
 */
async function hashServiceKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Authenticate platform from service key
    const serviceKeyHeader = req.headers.get("x-service-key");
    if (!serviceKeyHeader) {
      return new Response(
        JSON.stringify({ error: "Missing x-service-key header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const keyHash = await hashServiceKey(serviceKeyHeader);
    const { data: platform, error: platformError } = await supabase
      .from("platforms")
      .select("id, response_level")
      .eq("api_key_hash", keyHash)
      .single();

    if (platformError || !platform) {
      console.error("[Auth] Invalid service key");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const platformId = platform.id;
    console.log(`[Auth] Authenticated as platform: ${platformId}`);

    // Parse request body
    const { vai, capture } = await req.json();

    if (!vai || !capture) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: vai, capture" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Verify] Starting facial verification for V.A.I.: ${vai}, platform: ${platformId}`);

    // Step 2: Rate limit check — window from settings:facial_attempt_window_minutes
    const windowMinutes = await getSettingNumber(
      supabase,
      "facial_attempt_window_minutes"
    );
    const windowStart = new Date(
      Date.now() - windowMinutes * 60 * 1000
    ).toISOString();
    const { data: recentAttempts, error: attemptsError } = await supabase
      .from("facial_verification_attempts")
      .select("id")
      .eq("vai", vai)
      .eq("platform_id", platformId)
      .gte("attempted_at", windowStart);

    if (attemptsError) {
      console.error("[Rate Limit] Error checking attempts:", attemptsError);
    }

    const maxAttempts = await getSettingNumber(supabase, "attempt_count_n");
    const priorCount = recentAttempts?.length ?? 0;
    if (priorCount >= maxAttempts) {
      console.log(`[Rate Limit] Exceeded for V.A.I. ${vai} on platform ${platformId}`);
      return new Response(
        JSON.stringify({ error: "Too many attempts. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const attemptIndex = priorCount + 1;
    const engineUsed = await resolveAttemptEngine(supabase, attemptIndex);

    // Step 3: Load credential
    const { data: credential, error: credentialError } = await supabase
      .from("credentials")
      .select("*")
      .eq("vai", vai)
      .single();

    if (credentialError || !credential) {
      console.log(`[Credential] Not found: ${vai}`);
      return new Response(
        JSON.stringify({ error: "V.A.I. not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 4: Scope check - V.A.I. must have presented at this platform
    const { data: credentialPlatform, error: scopeError } = await supabase
      .from("credential_platforms")
      .select("*")
      .eq("vai", vai)
      .eq("platform_id", platformId)
      .single();

    if (scopeError || !credentialPlatform) {
      console.log(`[Scope] V.A.I. ${vai} never presented at platform ${platformId}`);
      return new Response(
        JSON.stringify({ error: "V.A.I. not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 5: State check - suspended or banned returns immediately without face check
    if (credential.state === "suspended") {
      console.log(`[State] V.A.I. ${vai} is suspended`);
      await supabase.from("facial_verification_attempts").insert({
        vai,
        platform_id: platformId,
        success: false,
        attempted_at: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({ result: "no_match", state: "suspended" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (credential.state === "banned") {
      console.log(`[State] V.A.I. ${vai} is banned`);
      await supabase.from("facial_verification_attempts").insert({
        vai,
        platform_id: platformId,
        success: false,
        attempted_at: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({ result: "no_match", state: "banned" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 6: Load newest baseline
    const { data: baselines, error: baselineError } = await supabase
      .from("baselines")
      .select("*")
      .eq("vai", vai)
      .order("created_at", { ascending: false })
      .limit(1);

    if (baselineError || !baselines || baselines.length === 0) {
      console.error(`[Baseline] No baseline found for V.A.I. ${vai}`);
      throw new Error("No baseline found for this V.A.I.");
    }

    const baseline = baselines[0];
    console.log(`[Baseline] Loaded baseline ID ${baseline.id}, enrollment_score=${baseline.enrollment_score}`);

    // Step 7: Decode capture from base64 to bytes
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

    // Step 8: Call face service
    const faceResult = await callFaceService(captureBlob);

    // Step 9: Cosine similarity via pgvector
    const { data: similarityResult, error: similarityError } = await supabase
      .rpc("calculate_cosine_similarity", {
        baseline_vector: baseline.vector,
        capture_vector: JSON.stringify(faceResult.vector),
      });

    if (similarityError) {
      console.error(`[Similarity] Error calculating similarity:`, similarityError);
      throw new Error(`Failed to calculate vector similarity: ${similarityError.message}`);
    }

    const similarity = similarityResult as number;
    console.log(`[Similarity] Cosine similarity: ${similarity}`);

    // Step 10: Band from settings — never FACE_MATCH_THRESHOLD or a constant.
    const greenMin = await getSettingNumber(supabase, "band_green_min");
    const yellowMin = await getSettingNumber(supabase, "band_yellow_min");
    if (yellowMin > greenMin) {
      throw new Error(
        "settings.band_yellow_min must be <= settings.band_green_min"
      );
    }
    const band = bandFromSimilarity(similarity, greenMin, yellowMin);
    const match = band !== "red";

    console.log(
      `[Band] enrollment_score=${baseline.enrollment_score}, ` +
        `similarity=${similarity}, green_min=${greenMin}, yellow_min=${yellowMin}, band=${band}`
    );

    // Step 11: Red past settings:reds_threshold → fourth state.
    let result: "match" | "no_match" | "rebaseline_required" = match
      ? "match"
      : "no_match";
    if (band === "red") {
      result = await recordRedAndResolve(supabase, vai);
    }

    // Step 12: Log attempt
    await supabase.from("facial_verification_attempts").insert({
      vai,
      platform_id: platformId,
      success: match,
      attempted_at: new Date().toISOString(),
    });

    // Step 13: Return result — engine and bands are settings, never constants
    const level = parseResponseLevel(platform.response_level);
    const shaped = shapePublicResponse(
      level,
      internalFromBand(band, similarity)
    );
    console.log(`[Result] ${result} band=${band} for V.A.I. ${vai} engine=${engineUsed}`);
    return new Response(
      JSON.stringify({
        ...shaped,
        ...(result === "rebaseline_required" ? { status: result } : {}),
        attempt: attemptIndex,
        attempt_max: maxAttempts,
        engine_used: engineUsed,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Verify] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
