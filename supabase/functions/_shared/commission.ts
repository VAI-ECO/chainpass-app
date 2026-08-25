import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { getSettingNumber } from "./settings.ts";

/**
 * §2.8 / §14.5 / §14.5a — ONE commission ledger.
 * Business and individual same shape. Payee = trolley_recipient_id ONLY.
 * Never join V.A.I. to legal identity.
 */

export type CommissionEvent = "origination" | "renewal";

export async function accrueCommission(
  supabase: SupabaseClient,
  args: {
    platform_id: string;
    vai: string;
    event: CommissionEvent;
    period?: string;
  }
): Promise<{ id: number } | { skipped: "house_no_commission" | "no_rate" }> {
  const { data: cred } = await supabase
    .from("credentials")
    .select("originating_platform_id")
    .eq("vai", args.vai)
    .maybeSingle();

  const originator = cred?.originating_platform_id;
  if (!originator) {
    return { skipped: "house_no_commission" };
  }

  const pay_platform_id = originator;

  const { data: pa } = await supabase
    .from("platform_agreements")
    .select("commission_rules, payment_method")
    .eq("platform_id", pay_platform_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const rules = (pa?.commission_rules ?? {}) as Record<string, unknown>;
  const rateKey = args.event === "origination" ? "origination_rate" : "renewal_rate";
  let rate =
    typeof rules[rateKey] === "number" ? (rules[rateKey] as number) : null;

  if (rate == null) {
    rate = await getSettingNumber(supabase, `commission_${rateKey}`);
    if (rate == null) {
      return { skipped: "no_rate" };
    }
  }

  let cap: number | null =
    typeof rules.cap === "number" ? (rules.cap as number) : null;
  if (cap == null) {
    cap = await getSettingNumber(supabase, "commission_cap");
  }

  let amount = rate;
  if (cap != null && amount > cap) amount = cap;

  const trolley_recipient_id =
    typeof rules.trolley_recipient_id === "string"
      ? rules.trolley_recipient_id
      : typeof pa?.payment_method === "string"
        ? pa.payment_method
        : null;

  const { data, error } = await supabase
    .from("commission_ledger")
    .insert({
      platform_id: pay_platform_id,
      vai: args.vai,
      event: args.event,
      amount,
      period: args.period ?? null,
      status: "accrued",
      trolley_recipient_id,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id };
}
