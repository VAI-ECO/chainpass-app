import { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type LedgerResult =
  | "level_refused"
  | "enroll_required"
  | "credential_inactive"
  | "credential_level_refused"
  | "terms_required"
  | "granted"
  | "no_match"
  | "block_depleted"
  | "error";

/**
 * §16.3 / §14.5 — every verification call writes a ledger row.
 * Block decrement only when billed_against_block is true (successful billable outcomes).
 */
export async function writeVerificationLedger(
  supabase: SupabaseClient,
  args: {
    platform_id: string;
    vai: string;
    call_type: string;
    result: string;
    billed_against_block: boolean;
  }
): Promise<void> {
  const { error } = await supabase.from("verification_ledger").insert({
    platform_id: args.platform_id,
    vai: args.vai,
    call_type: args.call_type,
    result: args.result,
    billed_against_block: args.billed_against_block,
  });
  if (error) {
    throw new Error(`verification_ledger insert failed: ${error.message}`);
  }
}

/**
 * Decrement the oldest block with remaining capacity for this platform.
 * Block size lives on the row / agreement — never a constant in code.
 * Returns false if no capacity remains (depleted).
 */
export async function decrementPlatformBlock(
  supabase: SupabaseClient,
  platform_id: string
): Promise<{ ok: true; block_id: number } | { ok: false; reason: "block_depleted" }> {
  const { data: blocks, error } = await supabase
    .from("blocks")
    .select("id, size, consumed")
    .eq("platform_id", platform_id)
    .order("purchased_at", { ascending: true });

  if (error) throw new Error(`blocks lookup failed: ${error.message}`);
  if (!blocks || blocks.length === 0) {
    return { ok: false, reason: "block_depleted" };
  }

  const open = blocks.find((b) => b.consumed < b.size);
  if (!open) {
    return { ok: false, reason: "block_depleted" };
  }

  const { error: uErr } = await supabase
    .from("blocks")
    .update({ consumed: open.consumed + 1 })
    .eq("id", open.id)
    .eq("consumed", open.consumed); // optimistic concurrency

  if (uErr) throw new Error(`blocks decrement failed: ${uErr.message}`);

  return { ok: true, block_id: open.id };
}

/**
 * §16.3 — every gate call decrements the block once platform+vai are known.
 * level_refused is before the product runs; it does not burn capacity.
 */
export function isBillableGateResult(result: string): boolean {
  return result !== "level_refused" && result !== "error" && result !== "block_depleted";
}

/**
 * Ledger + optional block burn for one gate call.
 * Always writes the ledger row. Decrements block only when billable and capacity exists.
 */
export async function recordGateConsumption(
  supabase: SupabaseClient,
  args: {
    platform_id: string;
    vai: string;
    call_type: "gate" | "gate_sign";
    result: string;
  }
): Promise<{ billed: boolean; depleted: boolean }> {
  let billed = false;
  let depleted = false;

  if (isBillableGateResult(args.result)) {
    const dec = await decrementPlatformBlock(supabase, args.platform_id);
    if (dec.ok) {
      billed = true;
    } else {
      depleted = true;
    }
  }

  await writeVerificationLedger(supabase, {
    platform_id: args.platform_id,
    vai: args.vai,
    call_type: args.call_type,
    result: depleted && isBillableGateResult(args.result) ? "block_depleted" : args.result,
    billed_against_block: billed,
  });

  return { billed, depleted };
}
