import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { compareCaptureToBaseline, type Band } from "./band-compare.ts";
import { getSetting } from "./settings.ts";

export type VisitRow = {
  vai: string;
  platform_id: string;
  agreement_id: string | null;
  terms_version: string | null;
  signed_at: string;
};

export async function findPlatformVisit(
  supabase: SupabaseClient,
  vai: string,
  platform_id: string
): Promise<VisitRow | null> {
  const { data, error } = await supabase
    .from("platform_visits")
    .select("vai, platform_id, agreement_id, terms_version, signed_at")
    .eq("vai", vai)
    .eq("platform_id", platform_id)
    .maybeSingle();

  if (error) throw new Error(`platform_visits lookup failed: ${error.message}`);
  return data as VisitRow | null;
}

/** Map band → gate outcome. Band always returned; never a percentage (§7). */
export function outcomeFromBand(band: Band): "granted" | "no_match" {
  if (band === "red") return "no_match";
  return "granted";
}

/**
 * Face vs baseline for an existing visit. Returns status + band only.
 */
export async function faceGateAgainstBaseline(
  supabase: SupabaseClient,
  vai: string,
  capture: string
): Promise<{ status: "granted" | "no_match"; band: Band }> {
  const { band } = await compareCaptureToBaseline(supabase, vai, capture);
  return { status: outcomeFromBand(band), band };
}

/**
 * First-visit terms sign (§14.2 / §14.2a / §14.3 / §16.3).
 * Request carries terms_version_id — ChainPass holds the document body on that row.
 * Never terms_doc_ref: a pointer is not the document (§14.2).
 */
export async function signFirstVisitTerms(
  supabase: SupabaseClient,
  args: {
    vai: string;
    platform_id: string;
    capture: string;
    /** Exact agreement_versions.id the member is signing (§14.2 item 4). */
    terms_version_id: string;
  }
): Promise<{ status: "granted" | "no_match"; band: Band; agreement_id?: string }> {
  const { vai, platform_id, capture, terms_version_id } = args;

  if (!terms_version_id) {
    throw new Error("terms_version_id required");
  }

  const existing = await findPlatformVisit(supabase, vai, platform_id);
  if (existing) {
    // Already signed — treat as return visit face check
    return faceGateAgainstBaseline(supabase, vai, capture);
  }

  const { band } = await compareCaptureToBaseline(supabase, vai, capture);
  if (outcomeFromBand(band) === "no_match") {
    return { status: "no_match", band };
  }

  // Load immutable document content by version id (§14.2 — ChainPass holds the body)
  const { data: ver, error: verErr } = await supabase
    .from("agreement_versions")
    .select("id, version, body, platform_id, subtype")
    .eq("id", terms_version_id)
    .maybeSingle();

  if (verErr) throw new Error(`agreement_versions lookup failed: ${verErr.message}`);
  if (!ver) throw new Error("unknown_terms_version_id");
  if (ver.platform_id !== platform_id) {
    throw new Error("terms_version_id not for this platform");
  }
  if (ver.subtype !== "terms") {
    throw new Error("terms_version_id must be subtype terms");
  }
  if (!ver.body) {
    throw new Error("agreement_versions.body missing — ChainPass must hold the document");
  }

  const { data: agreement, error: aErr } = await supabase
    .from("agreements")
    .insert({
      platform_id,
      type: "single",
      subtype: "terms",
      vai_1: vai,
      status: "complete",
      content_version_id: ver.id,
      closed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (aErr) throw new Error(`agreements insert failed: ${aErr.message}`);

  const engine = await getSetting(supabase, "engine_attempt_default");

  const { error: pErr } = await supabase.from("agreement_proofs").insert({
    agreement_id: agreement.id,
    agreement_version_id: ver.id,
    vai,
    engine_used: engine,
  });
  if (pErr) throw new Error(`agreement_proofs insert failed: ${pErr.message}`);

  const { error: vErr } = await supabase.from("platform_visits").insert({
    vai,
    platform_id,
    agreement_id: agreement.id,
    terms_version: ver.version,
  });
  if (vErr) throw new Error(`platform_visits insert failed: ${vErr.message}`);

  return { status: "granted", band, agreement_id: agreement.id };
}
