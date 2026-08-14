import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface FaceServiceResult {
  vector: number[];
  model: string;
  model_version: string;
  score: number;
}

/**
 * Call face service to generate embedding vector
 * Isolated boundary - fails loudly if env vars missing
 * Reused from generate-baseline and verify-vai-facial
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
    // Step 1: Parse and validate input
    const { session_id, capture, requirement_keys, affirmation_version } = await req.json();

    if (!session_id || typeof session_id !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid session_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!capture || typeof capture !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid capture" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(requirement_keys) || requirement_keys.length === 0) {
      return new Response(
        JSON.stringify({ error: "requirement_keys must be a non-empty array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!affirmation_version || typeof affirmation_version !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid affirmation_version" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Signature] Session: ${session_id}, Requirements: ${requirement_keys.join(", ")}, Affirmation: ${affirmation_version}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 2: Load session and extract VAI
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      console.error(`[Session] Not found: ${session_id}`);
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!session.vai) {
      console.error(`[Session] No V.A.I. assigned to session: ${session_id}`);
      return new Response(
        JSON.stringify({ error: "Session has no V.A.I. assigned" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const vai = session.vai;
    const platformId = session.platform_id;
    console.log(`[Session] V.A.I.: ${vai}, Platform: ${platformId}`);

    // Step 3: Rate limit check (per session, 10 attempts per 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentAttempts, error: attemptsError } = await supabase
      .from("facial_signature_attempts")
      .select("id")
      .eq("session_id", session_id)
      .gte("attempted_at", fiveMinutesAgo);

    if (attemptsError) {
      console.error("[Rate Limit] Error checking attempts:", attemptsError);
    }

    if (recentAttempts && recentAttempts.length >= 10) {
      console.log(`[Rate Limit] Exceeded for session ${session_id}`);
      return new Response(
        JSON.stringify({ error: "Too many attempts. Please wait before trying again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 4: Load credential
    const { data: credential, error: credentialError } = await supabase
      .from("credentials")
      .select("*")
      .eq("vai", vai)
      .single();

    if (credentialError || !credential) {
      console.error(`[Credential] Not found: ${vai}`);
      return new Response(
        JSON.stringify({ error: "Credential not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 5: State check - fail loudly if not active (should never happen during enrollment)
    if (credential.state === "suspended") {
      console.error(`[State] CRITICAL: Credential ${vai} is suspended during enrollment`);
      throw new Error("CRITICAL: Credential is suspended during enrollment. Session should not exist.");
    }
    if (credential.state === "banned") {
      console.error(`[State] CRITICAL: Credential ${vai} is banned during enrollment`);
      throw new Error("CRITICAL: Credential is banned during enrollment. Session should not exist.");
    }
    if (credential.state !== "active") {
      console.error(`[State] CRITICAL: Credential ${vai} has state '${credential.state}' during enrollment`);
      throw new Error(`CRITICAL: Credential state is '${credential.state}' during enrollment, expected 'active'.`);
    }

    console.log(`[State] Credential ${vai} is active`);

    // Step 6: Validate requirements and get current versions
    const requirementData: Array<{ key: string; version: string; platform_id: string | null }> = [];

    for (const key of requirement_keys) {
      // Get requirement and its current version
      const today = new Date().toISOString().split('T')[0];

      const { data: requirement, error: reqError } = await supabase
        .from("requirements")
        .select("key, ecosystem_wide")
        .eq("key", key)
        .single();

      if (reqError || !requirement) {
        throw new Error(`Requirement not found: ${key}`);
      }

      // Get current version (effective_from <= today, ordered desc)
      const { data: versions, error: versionError } = await supabase
        .from("requirement_versions")
        .select("version")
        .eq("requirement_key", key)
        .lte("effective_from", today)
        .order("effective_from", { ascending: false })
        .limit(1);

      if (versionError || !versions || versions.length === 0) {
        throw new Error(`No current version found for requirement: ${key}`);
      }

      const version = versions[0].version;
      const platformIdForCompletion = requirement.ecosystem_wide ? null : platformId;

      console.log(`[Requirement] ${key} v${version}, ecosystem_wide=${requirement.ecosystem_wide}, platform_id=${platformIdForCompletion || 'null'}`);

      requirementData.push({
        key,
        version,
        platform_id: platformIdForCompletion,
      });
    }

    // Step 7: Load newest baseline
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

    // Step 8: Decode capture from base64 to bytes
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

    console.log(`[Capture] Decoded ${captureBlob.byteLength} bytes from base64`);

    // Step 9: Call face service (ONE CHECK for all requirements)
    const faceResult = await callFaceService(captureBlob);

    // Step 10: Compare vectors using pgvector and threshold
    const FACE_MATCH_THRESHOLD = Deno.env.get("FACE_MATCH_THRESHOLD");
    if (!FACE_MATCH_THRESHOLD) {
      throw new Error("FACE_MATCH_THRESHOLD environment variable is not configured. Cannot proceed.");
    }

    const dropThreshold = parseFloat(FACE_MATCH_THRESHOLD);
    if (isNaN(dropThreshold)) {
      throw new Error(`FACE_MATCH_THRESHOLD must be a number, got: ${FACE_MATCH_THRESHOLD}`);
    }

    // Calculate cosine similarity using pgvector
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

    // Threshold is RELATIVE to enrollment_score, not global
    const minAllowedSimilarity = baseline.enrollment_score - dropThreshold;
    const match = similarity >= minAllowedSimilarity;

    console.log(
      `[Threshold] enrollment_score=${baseline.enrollment_score}, ` +
      `drop_threshold=${dropThreshold}, min_allowed=${minAllowedSimilarity}, ` +
      `similarity=${similarity}, match=${match}`
    );

    // Step 11: Log attempt
    await supabase.from("facial_signature_attempts").insert({
      session_id,
      success: match,
      attempted_at: new Date().toISOString(),
    });

    // Step 12: If match, write requirement_completions (one row per requirement)
    const signed: string[] = [];

    if (match) {
      const completions = requirementData.map(req => ({
        vai,
        requirement_key: req.key,
        platform_id: req.platform_id,
        signed_version: req.version,
        affirmation_version: affirmation_version,
        signed_at: new Date().toISOString(),
      }));

      const { error: completionError } = await supabase
        .from("requirement_completions")
        .insert(completions);

      if (completionError) {
        console.error("[Completions] Error writing completions:", completionError);
        throw new Error(`Failed to write requirement completions: ${completionError.message}`);
      }

      signed.push(...requirement_keys);
      console.log(`[Completions] Written ${completions.length} completions for V.A.I. ${vai}`);
    } else {
      console.log(`[Match] No match - no completions written`);
    }

    // Step 13: Return result
    const result = match ? "match" : "no_match";
    console.log(`[Result] ${result} for V.A.I. ${vai}, signed: [${signed.join(", ")}]`);

    return new Response(
      JSON.stringify({ result, signed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Signature] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
