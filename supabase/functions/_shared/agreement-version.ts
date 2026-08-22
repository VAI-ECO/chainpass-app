import { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type AgreementSubtype = "terms" | "contract";

export function assertAgreementSubtype(
  subtype: unknown
): asserts subtype is AgreementSubtype {
  if (
    subtype === "le_declaration" ||
    subtype === "le" ||
    subtype === "law_enforcement" ||
    subtype === "leo"
  ) {
    throw new Error("le_is_declaration_not_agreement_subtype");
  }
  if (subtype !== "terms" && subtype !== "contract") {
    throw new Error("subtype must be terms or contract");
  }
}

export type CurrentVersion = {
  id: string;
  platform_id: string;
  subtype: string;
  body: string;
  version: string;
  effective_from: string;
  notice: string | null;
};

export type SelectCurrent =
  | { status: "ok"; version: CurrentVersion }
  | { status: "none" }
  | { status: "multiple"; version_ids: string[] };

export type BindShown =
  | { ok: true; agreement_version_id: string }
  | { ok: false; error: "stale_document" };

/** Effective = effective_from ≤ now and body present. Unique or flag — never pick. */
export function selectCurrentVersion(rows: CurrentVersion[]): SelectCurrent {
  const withBody = rows.filter((v) => typeof v.body === "string" && v.body.length > 0);
  if (withBody.length === 0) return { status: "none" };
  if (withBody.length > 1) {
    return { status: "multiple", version_ids: withBody.map((v) => v.id) };
  }
  return { status: "ok", version: withBody[0] };
}

/** Shown id is a report of what the viewer rendered, not a choice. */
export function bindShownToCurrent(
  shown_version_id: string,
  current_id: string
): BindShown {
  if (shown_version_id !== current_id) {
    return { ok: false, error: "stale_document" };
  }
  return { ok: true, agreement_version_id: current_id };
}

export async function resolveCurrentVersion(
  supabase: SupabaseClient,
  platform_id: string,
  subtype: AgreementSubtype,
  at: Date = new Date()
): Promise<SelectCurrent> {
  const { data: versions, error } = await supabase
    .from("agreement_versions")
    .select("id, platform_id, body, subtype, effective_from, version, notice")
    .eq("platform_id", platform_id)
    .eq("subtype", subtype)
    .lte("effective_from", at.toISOString());

  if (error) throw new Error(error.message);
  return selectCurrentVersion((versions ?? []) as CurrentVersion[]);
}
