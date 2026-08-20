import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { getSetting } from "./settings.ts";
import { compareCaptureToBaseline } from "./band-compare.ts";
import { outcomeFromBand } from "./gate-visits.ts";

export type AgreementType = "single" | "dual";
export type AgreementSubtype = "terms" | "contract";

/** Create a new immutable version row (upload = insert only). */
export async function createAgreementVersion(
  supabase: SupabaseClient,
  args: {
    platform_id: string;
    subtype: AgreementSubtype;
    body: string;
    version: string;
    notice?: string | null;
  }
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("agreement_versions")
    .insert({
      platform_id: args.platform_id,
      subtype: args.subtype,
      body: args.body,
      version: args.version,
      notice: args.notice ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id };
}

export async function openAgreement(
  supabase: SupabaseClient,
  args: {
    platform_id: string;
    type: AgreementType;
    subtype: AgreementSubtype;
    vai_1: string;
    vai_2?: string | null;
    content_version_id: string;
    expires_at?: string | null;
  }
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("agreements")
    .insert({
      platform_id: args.platform_id,
      type: args.type,
      subtype: args.subtype,
      vai_1: args.vai_1,
      vai_2: args.vai_2 ?? null,
      status: "open",
      content_version_id: args.content_version_id,
      expires_at: args.expires_at ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id };
}

/**
 * Face verify one party. Signature points at VERSION id (§14.2 item 4).
 * Single closes on one proof; dual on two. Expired dual with one proof → void.
 */
export async function verifyAgreementParty(
  supabase: SupabaseClient,
  args: { agreement_id: string; vai: string; capture: string }
): Promise<{ status: string; band?: string }> {
  const { data: agr, error } = await supabase
    .from("agreements")
    .select("*")
    .eq("id", args.agreement_id)
    .single();
  if (error || !agr) throw new Error("agreement not found");

  const now = new Date();
  if (agr.expires_at && new Date(agr.expires_at) < now) {
    if (agr.type === "dual" && agr.status !== "complete") {
      await supabase
        .from("agreements")
        .update({ status: "void", closed_at: now.toISOString() })
        .eq("id", agr.id);
      return { status: "void" };
    }
    await supabase
      .from("agreements")
      .update({ status: "expired", closed_at: now.toISOString() })
      .eq("id", agr.id);
    return { status: "expired" };
  }

  if (!agr.content_version_id) {
    throw new Error("agreement missing content_version_id");
  }

  const { band } = await compareCaptureToBaseline(supabase, args.vai, args.capture);
  if (outcomeFromBand(band) === "no_match") {
    return { status: "no_match", band };
  }

  const engine = await getSetting(supabase, "engine_attempt_default");
  const { error: pErr } = await supabase.from("agreement_proofs").insert({
    agreement_id: agr.id,
    agreement_version_id: agr.content_version_id, // VERSION id, never agreement id alone
    vai: args.vai,
    engine_used: engine,
  });
  if (pErr) throw new Error(pErr.message);

  if (agr.type === "single") {
    await supabase
      .from("agreements")
      .update({ status: "complete", closed_at: now.toISOString() })
      .eq("id", agr.id);
    return { status: "complete", band };
  }

  // dual
  const { count } = await supabase
    .from("agreement_proofs")
    .select("id", { count: "exact", head: true })
    .eq("agreement_id", agr.id);

  if ((count ?? 0) >= 2) {
    await supabase
      .from("agreements")
      .update({ status: "complete", closed_at: now.toISOString() })
      .eq("id", agr.id);
    return { status: "complete", band };
  }

  await supabase
    .from("agreements")
    .update({ status: "party1_verified" })
    .eq("id", agr.id);
  return { status: "party1_verified", band };
}

export async function getAgreementProof(
  supabase: SupabaseClient,
  agreement_id: string
): Promise<Record<string, unknown>> {
  const { data: agr, error } = await supabase
    .from("agreements")
    .select("*")
    .eq("id", agreement_id)
    .single();
  if (error || !agr) throw new Error("agreement not found");

  // Re-evaluate expiry → void for dual with partial proofs
  if (
    agr.type === "dual" &&
    agr.status !== "complete" &&
    agr.expires_at &&
    new Date(agr.expires_at) < new Date()
  ) {
    await supabase
      .from("agreements")
      .update({ status: "void", closed_at: new Date().toISOString() })
      .eq("id", agr.id);
    agr.status = "void";
  }

  const { data: version } = await supabase
    .from("agreement_versions")
    .select("id, version, body, notice, created_at, effective_from")
    .eq("id", agr.content_version_id)
    .single();

  const { data: proofs } = await supabase
    .from("agreement_proofs")
    .select("vai, verified_at, engine_used, agreement_version_id")
    .eq("agreement_id", agreement_id);

  return {
    agreement_id: agr.id,
    status: agr.status,
    type: agr.type,
    subtype: agr.subtype,
    version, // exact version content — year-old wording preserved
    proofs: proofs ?? [],
  };
}
