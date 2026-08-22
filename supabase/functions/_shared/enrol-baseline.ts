/**
 * Face matcher for enrolment baseline. Fails loud — never stub a vector.
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
