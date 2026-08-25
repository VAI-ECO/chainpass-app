import { compareFrameTwoAgainstFrameOne } from "./frame-compare.ts";
import type { Band } from "./band-compare.ts";

/**
 * Face matcher for enrolment baseline. Fails loud — never accept a client vector.
 * FACE_SERVICE itself may be the deterministic stub until the live matcher is wired.
 */

export function requireFaceService(): { url: string; key: string } {
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

export function heldCaptureToBytes(held: string): Uint8Array {
  const dataUrl = held.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
  const b64 = dataUrl ? dataUrl[1] : held;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function heldCaptureToBase64(held: string): string {
  const dataUrl = held.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
  return dataUrl ? dataUrl[1] : held;
}

export type EmbeddedFrame = {
  vector: number[];
  model: string | undefined;
  model_version: string | undefined;
};

export async function embedFrame(
  face: { url: string; key: string },
  held: string
): Promise<EmbeddedFrame> {
  const imageBytes = heldCaptureToBytes(held);
  const hostedStub = /\/functions\/v1\//.test(face.url);
  const gatewayKey = hostedStub
    ? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")
    : undefined;
  const response = await fetch(face.url, {
    method: "POST",
    headers: hostedStub
      ? {
          Authorization: `Bearer ${gatewayKey ?? face.key}`,
          "Content-Type": "image/jpeg",
          ...(gatewayKey ? { apikey: gatewayKey, "X-Face-Key": face.key } : {}),
        }
      : {
          Authorization: `Bearer ${face.key}`,
          "Content-Type": "application/json",
        },
    body: hostedStub
      ? imageBytes.slice().buffer as ArrayBuffer
      : JSON.stringify({ image: heldCaptureToBase64(held) }),
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
    model: typeof result.model === "string" ? result.model : undefined,
    model_version: typeof result.model_version === "string" ? result.model_version : undefined,
  };
}

export async function embedBothAndCompare(
  face: { url: string; key: string },
  frameOneHeld: string,
  frameTwoHeld: string,
  greenMin: number,
  yellowMin: number
): Promise<{
  frameOne: EmbeddedFrame;
  frameTwo: EmbeddedFrame;
  band: Band;
  frames_compared: true;
}> {
  const frameOne = await embedFrame(face, frameOneHeld);
  const frameTwo = await embedFrame(face, frameTwoHeld);
  const compared = compareFrameTwoAgainstFrameOne(
    frameOne.vector,
    frameTwo.vector,
    greenMin,
    yellowMin
  );
  return { frameOne, frameTwo, ...compared };
}
