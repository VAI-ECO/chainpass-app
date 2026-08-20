import { SupabaseClient } from "npm:@supabase/supabase-js@2";

/**
 * Load a setting by key. Fails loudly if missing — never falls back to a constant.
 */
export async function getSetting(
  supabase: SupabaseClient,
  key: string
): Promise<string> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data?.value) {
    throw new Error(
      `settings.${key} is not configured. Cannot proceed without a settings row.`
    );
  }

  return data.value;
}

export async function getSettingNumber(
  supabase: SupabaseClient,
  key: string
): Promise<number> {
  const raw = await getSetting(supabase, key);
  const n = parseFloat(raw);
  if (isNaN(n)) {
    throw new Error(`settings.${key} must be a number, got: ${raw}`);
  }
  return n;
}
