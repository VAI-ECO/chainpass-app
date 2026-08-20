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
 * First-visit terms sign (§14.3 / §16.3): match → agreement (single, terms) + proof + visit.
 */
export async function signFirstVisitTerms(
  supabase: SupabaseClient,
  args: {
    vai: string;
    platform_id: string;
    capture: string;
  }
): Promise<{ status: "granted" | "no_match"; band: Band; agreement_id?: string }> {
  const { vai, platform_id, capture } = args;

  const existing = await findPlatformVisit(supabase, vai, platform_id);
  if (existing) {
    // Already signed — treat as return visit face check
    return faceGateAgainstBaseline(supabase, vai, capture);
  }

  const { band } = await compareCaptureToBaseline(supabase, vai, capture);
  if (outcomeFromBand(band) === "no_match") {
    return { status: "no_match", band };
  }

  // Resolve terms version for this platform (§14.3 — required at onboarding)
  const { data: pa, error: paErr } = await supabase
    .from("platform_agreements")
    .select("terms_doc_ref, terms_version")
    .eq("platform_id", platform_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paErr) throw new Error(`platform_agreements lookup failed: ${paErr.message}`);

  const termsVersion = pa?.terms_version ?? "1";

  let versionId: string | null = null;
  const { data: ver } = await supabase
    .from("agreement_versions")
    .select("id, version")
    .eq("platform_id", platform_id)
    .eq("subtype", "terms")
    .eq("version", termsVersion)
    .maybeSingle();

  if (ver?.id) {
    versionId = ver.id;
  } else {
    const body = pa?.terms_doc_ref ?? "platform terms";
    const { data: created, error: cErr } = await supabase
      .from("agreement_versions")
      .insert({
        platform_id,
        subtype: "terms",
        body,
        version: termsVersion,
      })
      .select("id")
      .single();
    if (cErr) throw new Error(`agreement_versions insert failed: ${cErr.message}`);
    versionId = created.id;
  }

  const { data: agreement, error: aErr } = await supabase
    .from("agreements")
    .insert({
      platform_id,
      type: "single",
      subtype: "terms",
      vai_1: vai,
      status: "complete",
      content_version_id: versionId,
      closed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (aErr) throw new Error(`agreements insert failed: ${aErr.message}`);

  const engine = await getSetting(supabase, "engine_attempt_default");

  const { error: pErr } = await supabase.from("agreement_proofs").insert({
    agreement_id: agreement.id,
    agreement_version_id: versionId,
    vai,
    engine_used: engine,
  });
  if (pErr) throw new Error(`agreement_proofs insert failed: ${pErr.message}`);

  const { error: vErr } = await supabase.from("platform_visits").insert({
    vai,
    platform_id,
    agreement_id: agreement.id,
    terms_version: termsVersion,
  });
  if (vErr) throw new Error(`platform_visits insert failed: ${vErr.message}`);

  return { status: "granted", band, agreement_id: agreement.id };
}
