import { supabase } from "@/integrations/supabase/client";

/**
 * Load a setting by key. settings.value is NOT NULL; UNSET is the string 'UNSET'.
 * Returns null so the caller can render unset. Never throws on UNSET.
 */
export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("settings" as never)
    .select("value")
    .eq("key", key)
    .maybeSingle();

  const value = (data as { value?: string } | null)?.value;
  if (error || value == null) {
    return null;
  }
  if (value === "UNSET") {
    return null;
  }
  return value;
}

export async function getSettingNumber(key: string): Promise<number | null> {
  const raw = await getSetting(key);
  if (raw == null) return null;
  const n = parseFloat(raw);
  if (Number.isNaN(n)) {
    return null;
  }
  return n;
}

/** Caller-side refusal after the reader returned null. The reader itself does not throw. */
export function refuseUnset(key: string): never {
  throw new Error(`settings.${key} is UNSET`);
}

export const SETTING_PRICE_VAI_PRO = "price_vai_pro";
export const SETTING_DEFERRAL_WINDOW_HOURS = "deferral_window_hours";
export const SETTING_CREDENTIAL_YEAR_LENGTH_YEARS = "credential_year_length_years";
