import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { getSettingNumber, refuseUnset } from "./settings.ts";

export type Band = "green" | "yellow" | "red";

interface FaceServiceResult {
  vector: number[];
  model: string;
  model_version: string;
  score: number;
}

async function callFaceService(imageBlob: ArrayBuffer): Promise<FaceServiceResult> {
  const FACE_SERVICE_URL = Deno.env.get("FACE_SERVICE_URL");
  const FACE_SERVICE_KEY = Deno.env.get("FACE_SERVICE_KEY");

  if (!FACE_SERVICE_URL) {
    throw new Error("FACE_SERVICE_URL environment variable is not configured. Cannot proceed.");
  }
  if (!FACE_SERVICE_KEY) {
    throw new Error("FACE_SERVICE_KEY environment variable is not configured. Cannot proceed.");
  }

  const response = await fetch(FACE_SERVICE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FACE_SERVICE_KEY}`,
      "Content-Type": "image/jpeg",
    },
    body: imageBlob,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Face service request failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (!result.vector || !Array.isArray(result.vector) || result.vector.length !== 512) {
    throw new Error(
      `Face service returned invalid vector (expected 512 floats, got ${result.vector?.length || 0})`
    );
  }
  if (!result.model || !result.model_version || typeof result.score !== "number") {
    throw new Error("Face service response missing required fields (model, model_version, score)");
  }

  return {
    vector: result.vector,
    model: result.model,
    model_version: result.model_version,
    score: result.score,
  };
}

function decodeCapture(capture: string): ArrayBuffer {
  let base64Data = capture;
  if (capture.includes(",")) {
    base64Data = capture.split(",")[1];
  }
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

/**
 * Map a similarity score to a band using settings rows — never constants.
 * Percentage stays at ChainPass; only the band leaves (§7).
 */
export function bandFromSimilarity(
  similarity: number,
  greenMin: number,
  yellowMin: number
): Band {
  if (similarity >= greenMin) return "green";
  if (similarity >= yellowMin) return "yellow";
  return "red";
}

/**
 * Fresh capture vs stored baseline → green | yellow | red.
 * No ComplyCube. No client ID. V.A.I. + face only.
 */
export async function compareCaptureToBaseline(
  supabase: SupabaseClient,
  vai: string,
  capture: string
): Promise<{ band: Band; similarity: number }> {
  const { data: baselines, error: baselineError } = await supabase
    .from("baselines")
    .select("*")
    .eq("vai", vai)
    .order("created_at", { ascending: false })
    .limit(1);

  if (baselineError || !baselines || baselines.length === 0) {
    throw new Error("No baseline found for this V.A.I.");
  }

  const baseline = baselines[0];
  const faceResult = await callFaceService(decodeCapture(capture));

  const { data: similarityResult, error: similarityError } = await supabase.rpc(
    "calculate_cosine_similarity",
    {
      baseline_vector: baseline.vector,
      capture_vector: JSON.stringify(faceResult.vector),
    }
  );

  if (similarityError) {
    throw new Error(`Failed to calculate vector similarity: ${similarityError.message}`);
  }

  const similarity = similarityResult as number;
  const greenMin = await getSettingNumber(supabase, "band_green_min") ?? refuseUnset("band_green_min");
  const yellowMin = await getSettingNumber(supabase, "band_yellow_min") ?? refuseUnset("band_yellow_min");

  if (yellowMin > greenMin) {
    throw new Error(
      "settings.band_yellow_min must be <= settings.band_green_min"
    );
  }

  const band = bandFromSimilarity(similarity, greenMin, yellowMin);

  console.log(
    `[Band] vai=${vai} similarity=${similarity} green_min=${greenMin} yellow_min=${yellowMin} band=${band}`
  );

  return { band, similarity };
}
