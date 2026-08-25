import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { getSetting, getSettingNumber } from "./settings.ts";

/**
 * 17 Aug facial stack — last attempt uses engine_attempt_last; earlier use default.
 * attemptIndex is 1-based.
 */
export async function resolveAttemptEngine(
  supabase: SupabaseClient,
  attemptIndex: number
): Promise<string> {
  const max = await getSettingNumber(supabase, "attempt_count_n");
  if (attemptIndex >= max) {
    return getSetting(supabase, "engine_attempt_last");
  }
  return getSetting(supabase, "engine_attempt_default");
}
