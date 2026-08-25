/**
 * §14.4 / §16.6 step 9 — inbound bank adapters.
 * Every engine output normalised to one internal shape.
 * Band cut-offs from settings (§7.3 / §15 item 12) — never literals.
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { bandFromSimilarity } from "./band-compare.ts";
import { getSettingNumber, refuseUnset } from "./settings.ts";
import { parseResponseLevel, shapePublicResponse, internalFromBand } from "./response-level.ts";

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
export async function normaliseMatchOutput(
  supabase: SupabaseClient,
  raw: Record<string, unknown>
): Promise<InternalMatchResult> {
  // { match, confidence } class — floors from settings.band_*_min (§7.3)
  if (typeof raw.match === "boolean" && typeof raw.confidence === "number") {
    const c = raw.confidence;
    const greenMin = await getSettingNumber(supabase, "band_green_min") ?? refuseUnset("band_green_min");
    const yellowMin = await getSettingNumber(supabase, "band_yellow_min") ?? refuseUnset("band_yellow_min");
    return { band: bandFromSimilarity(c, greenMin, yellowMin), _similarity: c };
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

/** Public API documented shape — one of three, from platforms.response_level. */
export function publicMatchShape(
  internal: InternalMatchResult,
  responseLevel: unknown = 1
): Record<string, unknown> {
  const sim = internal._similarity ?? 0;
  return shapePublicResponse(
    parseResponseLevel(responseLevel),
    internalFromBand(internal.band, sim)
  );
}
