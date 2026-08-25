/**
 * Deterministic FACE_SERVICE stand-in. Same image bytes → same 512-vector.
 * Not a client stub — enrol-baseline still rejects a posted vector.
 */

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export async function vectorFromImageBytes(bytes: Uint8Array): Promise<number[]> {
  const copy = bytes.slice();
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", copy));
  let seed = 0;
  for (let i = 0; i < digest.length; i++) {
    seed = (Math.imul(seed, 33) + digest[i]) >>> 0;
  }
  const next = mulberry32(seed);
  const vector = new Array<number>(512);
  for (let i = 0; i < 512; i++) {
    vector[i] = next() * 2 - 1;
  }
  return vector;
}

export async function handleFaceStubRequest(req: Request): Promise<Response> {
  const key = Deno.env.get("FACE_SERVICE_KEY");
  if (!key) {
    return new Response(
      JSON.stringify({ error: "FACE_SERVICE_KEY environment variable is not configured. Cannot proceed." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  const auth = req.headers.get("Authorization") ?? "";
  const xkey = req.headers.get("X-Face-Key") ?? "";
  if (auth !== `Bearer ${key}` && xkey !== key) {
    return new Response("unauthorized", { status: 401 });
  }
  // Accept either raw bytes (hosted-stub path) or the live JSON { image: base64 }
  // contract used by vec.chainpass.io/embed — so the same callers exercise both.
  let bytes: Uint8Array;
  const ctype = req.headers.get("Content-Type") ?? "";
  if (ctype.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    const b64 = typeof body.image === "string" ? body.image : "";
    const bin = atob(b64);
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  } else {
    bytes = new Uint8Array(await req.arrayBuffer());
  }
  const vector = await vectorFromImageBytes(bytes);
  return new Response(
    JSON.stringify({
      vector,
      model: "face-stub",
      model_version: "1",
      score: 1,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
