/**
 * §7 / §16.3 — band always; percentage only when response_level is 3.
 * Strip accidental similarity / score / confidence fields.
 */

const FORBIDDEN_KEYS = new Set([
  "similarity",
  "score",
  "confidence",
  "percent",
  "match_score",
  "distance",
]);

const FORBIDDEN_BANDS = new Set(["green", "yellow", "red"]);

export function assertNoPercentageInBody(body: Record<string, unknown>): void {
  const raw = JSON.stringify(body);
  if (/%/.test(raw)) {
    throw new Error("gate response must not contain a percentage sign");
  }
  // Reject numeric similarity-like values accidentally placed under band
  if ("band" in body && typeof body.band === "number") {
    throw new Error("band must be a named band, never a number");
  }
  if ("band" in body && typeof body.band === "string" && !FORBIDDEN_BANDS.has(body.band)) {
    throw new Error(`invalid band value: ${body.band}`);
  }
  for (const key of Object.keys(body)) {
    if (FORBIDDEN_KEYS.has(key)) {
      throw new Error(`gate response must not include ${key}`);
    }
  }
}

/** Final public JSON for gate endpoints — drops forbidden keys. Numeric percentage may leave (level 3). */
export function publicGateBody(
  body: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (FORBIDDEN_KEYS.has(k)) continue;
    if (k === "percentage" && typeof v !== "number") continue;
    out[k] = v;
  }
  assertNoPercentageInBody(out);
  return out;
}
