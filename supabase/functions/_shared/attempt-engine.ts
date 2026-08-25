import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { getSetting, getSettingNumber, refuseUnset } from "./settings.ts";

/**
 * 17 Aug facial stack — last attempt uses engine_attempt_last; earlier use default.
 * attemptIndex is 1-based.
 */
export async function resolveAttemptEngine(
  supabase: SupabaseClient,
  attemptIndex: number
): Promise<string> {
  const max = await getSettingNumber(supabase, "attempt_count_n") ?? refuseUnset("attempt_count_n");
  if (attemptIndex >= max) {
    return await getSetting(supabase, "engine_attempt_last") ?? refuseUnset("engine_attempt_last");
  }
  return await getSetting(supabase, "engine_attempt_default") ?? refuseUnset("engine_attempt_default");
}
