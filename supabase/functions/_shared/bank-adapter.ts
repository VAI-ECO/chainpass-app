/**
 * §14.4 / §16.6 step 9 — inbound bank adapters.
 * Every engine output normalised to one internal shape.
 */

export type InternalMatchResult = {
  band: "green" | "yellow" | "red";
  /** Internal only — never returned on public gate responses */
  _similarity?: number;
};

export type InternalProviderVerdict = {
  passed: boolean;
  session_key: string | null;
};

/** Normalise heterogeneous engine payloads into InternalMatchResult. */
export function normaliseMatchOutput(raw: Record<string, unknown>): InternalMatchResult {
  // { match, confidence } class
  if (typeof raw.match === "boolean" && typeof raw.confidence === "number") {
    const c = raw.confidence;
    if (c >= 0.8) return { band: "green", _similarity: c };
    if (c >= 0.65) return { band: "yellow", _similarity: c };
    return { band: "red", _similarity: c };
  }
  // { result } class
  if (raw.result === "match" || raw.result === "green") return { band: "green" };
  if (raw.result === "yellow") return { band: "yellow" };
  if (raw.result === "no_match" || raw.result === "red") return { band: "red" };
  // { band }
  if (raw.band === "green" || raw.band === "yellow" || raw.band === "red") {
    return { band: raw.band };
  }
  throw new Error("unrecognised engine output shape");
}

export function normaliseProviderVerdict(raw: Record<string, unknown>): InternalProviderVerdict {
  const passed = raw.passed === true || raw.status === "clear" || raw.result === "pass";
  const session_key =
    typeof raw.session_key === "string"
      ? raw.session_key
      : typeof raw.clientId === "string"
        ? raw.clientId
        : null;
  return { passed, session_key };
}

/** Public API documented shape — band only for match endpoints. */
export function publicMatchShape(internal: InternalMatchResult): { band: string } {
  return { band: internal.band };
}
