/**
 * §16.6 step 7 / §14.5a — settlement: accrued → payable → settled.
 * Payee identity is trolley_recipient_id ONLY. PII stays at the rail.
 */
import { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type SettlementResult = {
  marked_payable: number;
  marked_settled: number;
  skipped_no_recipient: number;
};

/**
 * Accrued → payable for rows that have a trolley_recipient_id.
 * Rows without a recipient stay accrued (cannot settle blindly).
 */
export async function markAccruedPayable(
  supabase: SupabaseClient,
  opts?: { platform_id?: string; limit?: number }
): Promise<{ marked: number; skipped_no_recipient: number }> {
  let q = supabase
    .from("commission_ledger")
    .select("id, trolley_recipient_id")
    .eq("status", "accrued")
    .order("id", { ascending: true })
    .limit(opts?.limit ?? 500);
  if (opts?.platform_id) q = q.eq("platform_id", opts.platform_id);

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  let marked = 0;
  let skipped_no_recipient = 0;
  for (const row of data ?? []) {
    if (!row.trolley_recipient_id) {
      skipped_no_recipient++;
      continue;
    }
    const { error: uErr } = await supabase
      .from("commission_ledger")
      .update({ status: "payable" })
      .eq("id", row.id)
      .eq("status", "accrued");
    if (uErr) throw new Error(uErr.message);
    marked++;
  }
  return { marked, skipped_no_recipient };
}

/**
 * Payable → settled. Caller supplies trolley payout batch id only.
 * Does not look up payee PII; the rail holds those (§14.5a items 3–4).
 */
export async function settlePayable(
  supabase: SupabaseClient,
  opts: {
    trolley_payout_ref: string;
    platform_id?: string;
    limit?: number;
  }
): Promise<{ marked: number }> {
  if (!opts.trolley_payout_ref) {
    throw new Error("trolley_payout_ref required");
  }

  let q = supabase
    .from("commission_ledger")
    .select("id, trolley_recipient_id")
    .eq("status", "payable")
    .not("trolley_recipient_id", "is", null)
    .order("id", { ascending: true })
    .limit(opts.limit ?? 500);
  if (opts.platform_id) q = q.eq("platform_id", opts.platform_id);

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  let marked = 0;
  for (const row of data ?? []) {
    const { error: uErr } = await supabase
      .from("commission_ledger")
      .update({
        status: "settled",
        period: opts.trolley_payout_ref,
      })
      .eq("id", row.id)
      .eq("status", "payable");
    if (uErr) throw new Error(uErr.message);
    marked++;
  }
  return { marked };
}

/** Full job: accrued→payable then payable→settled for one trolley batch. */
export async function runSettlementJob(
  supabase: SupabaseClient,
  opts: { trolley_payout_ref: string; platform_id?: string }
): Promise<SettlementResult> {
  const payable = await markAccruedPayable(supabase, {
    platform_id: opts.platform_id,
  });
  const settled = await settlePayable(supabase, {
    trolley_payout_ref: opts.trolley_payout_ref,
    platform_id: opts.platform_id,
  });
  return {
    marked_payable: payable.marked,
    marked_settled: settled.marked,
    skipped_no_recipient: payable.skipped_no_recipient,
  };
}
