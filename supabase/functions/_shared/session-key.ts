/** Owner ruling 25 August: the session key is 30 characters, alphanumeric. CANON-CP-02 §1 step 3. */

export const SESSION_KEY_LENGTH = 30;

const ALPHANUM =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateSessionKey(): string {
  const out = new Array<string>(SESSION_KEY_LENGTH);
  const bytes = new Uint8Array(SESSION_KEY_LENGTH);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < SESSION_KEY_LENGTH; i++) {
    out[i] = ALPHANUM[bytes[i] % ALPHANUM.length];
  }
  return out.join("");
}

export function assertSessionKeyLength(value: string): void {
  if (value.length !== SESSION_KEY_LENGTH) {
    throw new Error("session_key must be 30 characters");
  }
  if (!/^[A-Za-z0-9]+$/.test(value)) {
    throw new Error("session_key must be alphanumeric");
  }
}
