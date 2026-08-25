/**
 * RULINGS-CP-04 — one computation, three public shapes.
 * The adapter is the only place any of the three is read (§14.4 item 4).
 */

export type ResponseLevel = 1 | 2 | 3;
export type Band = "green" | "yellow" | "red";

export type InternalFaceResult = {
  match: boolean;
  band: Band;
  percentage: number;
};

export function parseResponseLevel(raw: unknown): ResponseLevel {
  const n = Number(raw);
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 1;
}

export function percentageFromSimilarity(similarity: number): number {
  return Math.round(similarity * 10000) / 100;
}

export function internalFromBand(
  band: Band,
  similarity: number
): InternalFaceResult {
  return {
    match: band === "green",
    band,
    percentage: percentageFromSimilarity(similarity),
  };
}

/** Public shape for the platform's chosen level. Computation is already done. */
export function shapePublicResponse(
  level: ResponseLevel,
  internal: InternalFaceResult
): Record<string, unknown> {
  if (level === 1) return { match: internal.match };
  if (level === 2) return { band: internal.band };
  return { band: internal.band, percentage: internal.percentage };
}

/**
 * CANON-CP-04 §2. Trial is one state at every response level.
 * Never match, never a band, never a percentage.
 */
export function trialApprovedBody(_level?: ResponseLevel): Record<string, unknown> {
  return { status: "trial_approved" };
}

function isBand(v: unknown): v is Band {
  return v === "green" || v === "yellow" || v === "red";
}

/**
 * Read any of the three public shapes (or the old { result } / { match, confidence }
 * names) into one internal result. This is the only reader.
 */
export function normalisePublicShape(
  body: Record<string, unknown>
): InternalFaceResult {
  if (isBand(body.band) && typeof body.percentage === "number") {
    return {
      band: body.band,
      percentage: body.percentage,
      match: body.band === "green",
    };
  }
  if (isBand(body.band)) {
    return {
      band: body.band,
      percentage: 0,
      match: body.band === "green",
    };
  }
  if (typeof body.match === "boolean") {
    return {
      match: body.match,
      band: body.match ? "green" : "red",
      percentage: typeof body.confidence === "number"
        ? percentageFromSimilarity(body.confidence)
        : 0,
    };
  }
  if (body.result === "match" || body.result === "yes") {
    return { match: true, band: "green", percentage: 0 };
  }
  if (body.result === "no_match" || body.result === "no") {
    return { match: false, band: "red", percentage: 0 };
  }
  throw new Error("unrecognised response shape");
}
