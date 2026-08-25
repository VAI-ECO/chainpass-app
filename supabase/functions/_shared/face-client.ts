/**
 * Live FACE_SERVICE is POST /embed JSON { image: base64 }.
 * Hosted stub is raw JPEG behind the Supabase gateway.
 */

export type FaceServiceResult = {
  vector: number[];
  model: string;
  model_version: string;
  score?: number;
};

export function requireFaceServiceEnv(): { url: string; key: string } {
  const url = Deno.env.get("FACE_SERVICE_URL");
  const key = Deno.env.get("FACE_SERVICE_KEY");
  if (!url) {
    throw new Error(
      "FACE_SERVICE_URL environment variable is not configured. Cannot proceed."
    );
  }
  if (!key) {
    throw new Error(
      "FACE_SERVICE_KEY environment variable is not configured. Cannot proceed."
    );
  }
  return { url, key };
}

function isHostedStub(url: string): boolean {
  return /\/functions\/v1\//.test(url) || /face-stub/.test(url);
}

export async function embedImageBytes(
  imageBlob: ArrayBuffer,
  face?: { url: string; key: string }
): Promise<FaceServiceResult> {
  const creds = face ?? requireFaceServiceEnv();
  const hostedStub = isHostedStub(creds.url);
  const bytes = new Uint8Array(imageBlob);
  let b64 = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    b64 += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  b64 = btoa(b64);
  // Live FACE_SERVICE (vec.chainpass.io/embed) is POST JSON { image: base64 }.
  // The hosted stub accepts both raw bytes and the JSON contract so callers are
  // identical across environments.

  const gatewayKey = hostedStub
    ? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")
    : undefined;

  const response = await fetch(creds.url, {
    method: "POST",
    headers: hostedStub
      ? {
          Authorization: `Bearer ${gatewayKey ?? creds.key}`,
          "Content-Type": "image/jpeg",
          ...(gatewayKey ? { apikey: gatewayKey, "X-Face-Key": creds.key } : {}),
        }
      : {
          Authorization: `Bearer ${creds.key}`,
          "Content-Type": "application/json",
        },
    body: hostedStub ? imageBlob : JSON.stringify({ image: b64 }),
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
  return {
    vector: result.vector,
    model: typeof result.model === "string" ? result.model : "unknown",
    model_version:
      typeof result.model_version === "string" ? result.model_version : "unknown",
    score: typeof result.score === "number" ? result.score : undefined,
  };
}
