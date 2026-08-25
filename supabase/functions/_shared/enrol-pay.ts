/**
 * §2 step 3 PAY — prices and deferral from settings / platform_agreements.
 * Never literals (§1.1a / §15 item 12).
 */
import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { getSettingNumber, refuseUnset } from "./settings.ts";

export type PayQuote = {
  required_credential_level: number;
  price: number;
  price_standard: number;
  price_pro: number;
  /** Upsell difference = pro − required tier price (§1.1a). */
  upsell_difference: number | null;
  requirements: {
    required_credential_level: number;
    collection_fields: unknown;
  };
  deferral: null | {
    offered: true;
    window_hours: number;
    once_ever: true;
  };
};

export async function buildPayQuote(
  supabase: SupabaseClient,
  platform_id: string
): Promise<PayQuote> {
  const { data: pa, error } = await supabase
    .from("platform_agreements")
    .select(
      "required_credential_level, collection_fields, deferral_offered, deferral_window_hours"
    )
    .eq("platform_id", platform_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`platform_agreements lookup failed: ${error.message}`);
  if (!pa) throw new Error("platform_agreements missing — cannot quote pay");

  const level = pa.required_credential_level ?? 1;
  const priceStandard = await getSettingNumber(supabase, "price_vai") ?? refuseUnset("price_vai");
  const pricePro = await getSettingNumber(supabase, "price_vai_pro") ?? refuseUnset("price_vai_pro");
  const price = level >= 3 ? pricePro : priceStandard;
  const upsell_difference =
    level < 3 ? pricePro - priceStandard : null;

  let deferral: PayQuote["deferral"] = null;
  if (pa.deferral_offered === true) {
    const window_hours =
      typeof pa.deferral_window_hours === "number" && pa.deferral_window_hours > 0
        ? pa.deferral_window_hours
        : await getSettingNumber(supabase, "deferral_window_hours") ?? refuseUnset("deferral_window_hours");
    deferral = { offered: true, window_hours, once_ever: true };
  }

  return {
    required_credential_level: level,
    price,
    price_standard: priceStandard,
    price_pro: pricePro,
    upsell_difference,
    requirements: {
      required_credential_level: level,
      collection_fields: pa.collection_fields,
    },
    deferral,
  };
}

export function assertWarningBeforePay(session: {
  warning_acked_at: string | null;
  biometric_consent_at: string | null;
}): void {
  if (!session.warning_acked_at || !session.biometric_consent_at) {
    throw new Error("warning_and_consent_required_before_pay");
  }
}
