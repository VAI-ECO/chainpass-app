/**
 * §2.5 — Platform ID rides in a SIGNED TOKEN. Never a query parameter.
 * Compact HMAC token: base64url(payload).base64url(sig)
 */

function b64url(data: Uint8Array | string): string {
  const bytes =
    typeof data === "string" ? new TextEncoder().encode(data) : data;
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export type EnrolmentTokenPayload = {
  platform_id: string;
  purpose: "enrol";
  iat: number;
  exp: number;
};

function enrolmentSecret(): string {
  const s =
    Deno.env.get("ENROLMENT_TOKEN_SECRET") ||
    Deno.env.get("JWT_SECRET") ||
    Deno.env.get("API_JWT_SECRET");
  if (!s) {
    throw new Error("ENROLMENT_TOKEN_SECRET is not configured");
  }
  return s;
}

/** Sign an enrolment token carrying platform_id (§2.5). TTL default 1h. */
export async function signEnrolmentToken(
  platform_id: string,
  ttlSeconds = 3600
): Promise<string> {
  if (!platform_id) throw new Error("platform_id required for enrolment token");
  const now = Math.floor(Date.now() / 1000);
  const payload: EnrolmentTokenPayload = {
    platform_id,
    purpose: "enrol",
    iat: now,
    exp: now + ttlSeconds,
  };
  const body = b64url(JSON.stringify(payload));
  const key = await hmacKey(enrolmentSecret());
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))
  );
  return `${body}.${b64url(sig)}`;
}

export async function verifyEnrolmentToken(
  token: string
): Promise<EnrolmentTokenPayload> {
  const parts = token.split(".");
  if (parts.length !== 2) throw new Error("invalid enrolment token");
  const [body, sigB64] = parts;
  const key = await hmacKey(enrolmentSecret());
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))
  );
  const actual = fromB64url(sigB64);
  if (expected.length !== actual.length) throw new Error("invalid enrolment token");
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= expected[i] ^ actual[i];
  if (mismatch !== 0) throw new Error("invalid enrolment token");

  const payload = JSON.parse(
    new TextDecoder().decode(fromB64url(body))
  ) as EnrolmentTokenPayload;
  if (payload.purpose !== "enrol") throw new Error("invalid enrolment token purpose");
  if (!payload.platform_id) throw new Error("enrolment token missing platform_id");
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new Error("enrolment token expired");
  return payload;
}
