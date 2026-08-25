import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { getSettingNumber } from "./settings.ts";
import { accrueCommission } from "./commission.ts";

/**
 * §10 / §16.4 — after successful renewal verification, advance the year from verified_at.
 * Payment never moves year_starts_at / year_ends_at.
 */
export async function advanceCredentialYearFromVerification(
  supabase: SupabaseClient,
  vai: string,
  verified_at: Date = new Date()
): Promise<void> {
  // Window length from settings — prior multi-year figure superseded.
  const years = await getSettingNumber(supabase, "credential_year_length_years");
  const start = verified_at;
  const end = new Date(start);
  end.setUTCFullYear(end.getUTCFullYear() + years);

  // Year from verification only — never touch paid_at (§16.4 / §10).
  const { error } = await supabase
    .from("credentials")
    .update({
      verified_at: start.toISOString(),
      year_starts_at: start.toISOString(),
      year_ends_at: end.toISOString(),
      next_renewal_date: end.toISOString().slice(0, 10),
    })
    .eq("vai", vai);
  if (error) throw new Error(error.message);
}

/** Append-only baseline on fresh provider renewal path. */
export async function appendRenewalBaseline(
  supabase: SupabaseClient,
  args: {
    vai: string;
    vector: number[];
    model: string;
    model_version: string;
    engine?: string | null;
    is_trial?: boolean;
  }
): Promise<void> {
  const { error } = await supabase.from("baselines").insert({
    vai: args.vai,
    vector: args.vector,
    model: args.model,
    model_version: args.model_version,
    engine: args.engine ?? null,
    is_trial: args.is_trial === true,
    enrollment_score: 0,
    source: "in_house",
  });
  if (error) throw new Error(error.message);
}

/**
 * Provider dedup (§2.4b): same session key returned — no stored provider pointer.
 * We look up credential_keys by session_key match only when the user re-presents it.
 */
export async function resolveSessionKeyDedup(
  supabase: SupabaseClient,
  vai: string,
  presented_session_key: string
): Promise<{ session_key: string; matched: boolean }> {
  const { data } = await supabase
    .from("credential_keys")
    .select("session_key")
    .eq("vai", vai)
    .eq("session_key", presented_session_key)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data?.session_key) {
    return { session_key: data.session_key, matched: true };
  }
  // Append the key the user got back from provider dedup (same key)
  await supabase.from("credential_keys").insert({
    vai,
    session_key: presented_session_key,
  });
  return { session_key: presented_session_key, matched: false };
}

export async function accrueRenewalCommission(
  supabase: SupabaseClient,
  vai: string
): Promise<void> {
  await accrueCommission(supabase, {
    platform_id: "", // ignored — originator read from credential
    vai,
    event: "renewal",
  });
}
