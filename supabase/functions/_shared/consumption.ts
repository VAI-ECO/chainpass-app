import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { getSettingNumber } from "./settings.ts";

/**
 * §14.5 / §16.6 step 5 — block size from settings or platform agreement.
 * Never a constant in code.
 */
export async function resolveBlockSize(
  supabase: SupabaseClient,
  platform_id: string
): Promise<number> {
  const { data: pa } = await supabase
    .from("platform_agreements")
    .select("consumption_block_size")
    .eq("platform_id", platform_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pa?.consumption_block_size && pa.consumption_block_size > 0) {
    return pa.consumption_block_size;
  }

  return getSettingNumber(supabase, "consumption_block_size");
}

/**
 * Purchase a consumption block. Size from settings/agreement — never hardcoded.
 */
export async function purchaseBlock(
  supabase: SupabaseClient,
  platform_id: string
): Promise<{ block_id: number; size: number }> {
  const size = await resolveBlockSize(supabase, platform_id);
  const { data, error } = await supabase
    .from("blocks")
    .insert({ platform_id, size, consumed: 0 })
    .select("id, size")
    .single();
  if (error) throw new Error(`block purchase failed: ${error.message}`);
  return { block_id: data.id, size: data.size };
}

/**
 * Burn rate and projected-empty — COMPUTED, never stored (§16.6 step 5 item 3).
 */
export async function computeConsumptionProjection(
  supabase: SupabaseClient,
  platform_id: string,
  windowHours = 24
): Promise<{
  remaining: number;
  burned_in_window: number;
  burn_per_hour: number;
  projected_empty_at: string | null;
}> {
  const { data: blocks, error } = await supabase
    .from("blocks")
    .select("size, consumed")
    .eq("platform_id", platform_id);
  if (error) throw new Error(error.message);

  const remaining = (blocks ?? []).reduce(
    (acc, b) => acc + Math.max(0, b.size - b.consumed),
    0
  );

  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
  const { data: ledger, error: lErr } = await supabase
    .from("verification_ledger")
    .select("id")
    .eq("platform_id", platform_id)
    .eq("billed_against_block", true)
    .gte("at", since);
  if (lErr) throw new Error(lErr.message);

  const burned_in_window = ledger?.length ?? 0;
  const burn_per_hour = windowHours > 0 ? burned_in_window / windowHours : 0;

  let projected_empty_at: string | null = null;
  if (burn_per_hour > 0 && remaining > 0) {
    const hoursLeft = remaining / burn_per_hour;
    projected_empty_at = new Date(
      Date.now() + hoursLeft * 60 * 60 * 1000
    ).toISOString();
  } else if (remaining === 0) {
    projected_empty_at = new Date().toISOString();
  }

  return { remaining, burned_in_window, burn_per_hour, projected_empty_at };
}
