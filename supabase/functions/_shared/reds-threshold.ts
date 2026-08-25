import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { getSettingNumber, refuseUnset } from "./settings.ts";

/**
 * §9.1 item 2 — lifetime reds vs settings:reds_threshold.
 * Past the threshold, the next red returns rebaseline_required instead of another red.
 * Never invents the count — UNSET is null from the reader; this caller refuses.
 */
export async function recordRedAndResolve(
  supabase: SupabaseClient,
  vai: string
): Promise<"no_match" | "rebaseline_required"> {
  const threshold = await getSettingNumber(supabase, "reds_threshold") ?? refuseUnset("reds_threshold");

  const { data: cred, error } = await supabase
    .from("credentials")
    .select("reds_count")
    .eq("vai", vai)
    .single();
  if (error || !cred) {
    throw new Error(`credentials.reds_count lookup failed: ${error?.message ?? "missing"}`);
  }

  const reds = Number(cred.reds_count ?? 0);
  if (reds >= threshold) {
    return "rebaseline_required";
  }

  const { error: uErr } = await supabase
    .from("credentials")
    .update({ reds_count: reds + 1 })
    .eq("vai", vai)
    .eq("reds_count", reds);
  if (uErr) throw new Error(`credentials.reds_count increment failed: ${uErr.message}`);

  return "no_match";
}
