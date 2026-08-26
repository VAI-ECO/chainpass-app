/**
 * §11.2 / §11.4 — a shortfall is a list and a destination, never a refusal.
 * §11.3 — the asking party in a two-person meet learns only "not met".
 */
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type ShortfallItem = {
  kind: "credential_level" | "platform_requirement";
  key?: string;
  display_name?: string;
};

export type ShortfallRoute = {
  url: string;
  enrolment_token?: string | null;
};

export const SHORTFALL_PAGE = "/verify/shortfall";

export function holderShortfall(args: {
  missing: ShortfallItem[];
  route: ShortfallRoute;
}): {
  status: "shortfall";
  missing: ShortfallItem[];
  route: ShortfallRoute;
} {
  return {
    status: "shortfall",
    missing: args.missing,
    route: args.route,
  };
}

export function askingPartyNotMet(): { status: "not_met" } {
  return { status: "not_met" };
}

/** VAI Go (1) and VAI Access (2): at most three requirements. VAI Pro (3): no cap. */
export function assertAccessVaiRequirementCap(
  service_level: number,
  count: number
): void {
  if (service_level < 3 && count > 3) {
    throw new Error("access_vai_requirement_cap");
  }
}

export async function listMissingPlatformRequirements(
  supabase: SupabaseClient,
  vai: string,
  platform_id: string
): Promise<ShortfallItem[]> {
  const { data: reqs, error: rErr } = await supabase
    .from("platform_requirements")
    .select("requirement_key, sort_order")
    .eq("platform_id", platform_id)
    .order("sort_order", { ascending: true });
  if (rErr) throw new Error(rErr.message);

  const { data: completions, error: cErr } = await supabase
    .from("requirement_completions")
    .select("requirement_key")
    .eq("vai", vai);
  if (cErr) throw new Error(cErr.message);

  const onFile = new Set((completions ?? []).map((c) => c.requirement_key));
  const keys = (reqs ?? []).map((r) => r.requirement_key).filter((k) => !onFile.has(k));
  if (keys.length === 0) return [];

  const { data: catalog } = await supabase
    .from("requirements")
    .select("key, display_name")
    .in("key", keys);
  const names = new Map((catalog ?? []).map((r) => [r.key, r.display_name] as const));

  return keys.map((key) => ({
    kind: "platform_requirement" as const,
    key,
    display_name: names.get(key) ?? key,
  }));
}

export function levelShortItem(required_level: number): ShortfallItem {
  const display_name =
    required_level === 3 ? "VAI Pro" : required_level === 2 ? "VAI Access" : "VAI Go";
  return { kind: "credential_level", key: "credential_level", display_name };
}
