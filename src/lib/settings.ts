import { supabase } from "@/integrations/supabase/client";

/**
 * Load a setting by key. Fails loudly if missing — never falls back to a constant.
 */
export async function getSetting(key: string): Promise<string> {
  const { data, error } = await supabase
    .from("settings" as never)
    .select("value")
    .eq("key", key)
    .single();

  const value = (data as { value?: string } | null)?.value;
  if (error || !value) {
    throw new Error(
      `settings.${key} is not configured. Cannot proceed without a settings row.`
    );
  }
  return value;
}

export async function getSettingNumber(key: string): Promise<number> {
  const raw = await getSetting(key);
  if (raw === "UNSET" || raw === "") {
    throw new Error(
      `settings.${key} is UNSET. Set it on SN-44 before this path can run.`
    );
  }
  const n = parseFloat(raw);
  if (Number.isNaN(n)) {
    throw new Error(`settings.${key} must be a number, got: ${raw}`);
  }
  return n;
}

export const SETTING_PRICE_VAI_PRO = "price_vai_pro";
export const SETTING_DEFERRAL_WINDOW_HOURS = "deferral_window_hours";
export const SETTING_CREDENTIAL_YEAR_LENGTH_YEARS = "credential_year_length_years";
