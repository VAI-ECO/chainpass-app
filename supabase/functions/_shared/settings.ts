import { SupabaseClient } from "npm:@supabase/supabase-js@2";

/**
 * Load a setting by key. settings.value is NOT NULL; UNSET is the string 'UNSET'.
 * Returns null so the caller can render unset. Never throws on UNSET.
 */
export async function getSetting(
  supabase: SupabaseClient,
  key: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error || data?.value == null) {
    return null;
  }
  if (data.value === "UNSET") {
    return null;
  }

  return data.value;
}

export async function getSettingNumber(
  supabase: SupabaseClient,
  key: string
): Promise<number | null> {
  const raw = await getSetting(supabase, key);
  if (raw == null) return null;
  const n = parseFloat(raw);
  if (isNaN(n)) {
    return null;
  }
  return n;
}

/** Caller-side refusal after the reader returned null. The reader itself does not throw. */
export function refuseUnset(key: string): never {
  throw new Error(`settings.${key} is UNSET`);
}
