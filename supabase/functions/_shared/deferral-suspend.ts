import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { getSettingNumber } from "./settings.ts";
import { emitEvent } from "./emit-event.ts";

/**
 * §4A.3 — deferred credentials past settings:deferral_suspend_after are suspended.
 * Not deleted. Not banned. Use is withheld until payment.
 */
export async function suspendExpiredDeferrals(
  supabase: SupabaseClient,
  now = new Date()
): Promise<number> {
  const suspendAfterHours = await getSettingNumber(
    supabase,
    "deferral_suspend_after"
  );

  const { data: rows, error } = await supabase
    .from("credentials")
    .select("vai, verified_at, deferral_expires_at, deferral_used, state")
    .eq("deferral_used", true)
    .not("state", "in", "(suspended,banned)");

  if (error) throw new Error(`deferral suspend lookup failed: ${error.message}`);

  let suspended = 0;
  for (const row of rows ?? []) {
    const deadline = deadlineForDeferral(row, suspendAfterHours);
    if (!deadline || now < deadline) continue;

    const { error: uErr } = await supabase
      .from("credentials")
      .update({
        state: "suspended",
        state_changed_at: now.toISOString(),
      })
      .eq("vai", row.vai)
      .eq("deferral_used", true)
      .not("state", "in", "(suspended,banned)");
    if (uErr) throw new Error(`deferral suspend failed: ${uErr.message}`);

    await emitEvent(supabase, row.vai, "credential.suspended", {
      reason: "deferral_suspend_after",
      setting: "deferral_suspend_after",
    });
    suspended++;
  }
  return suspended;
}

function deadlineForDeferral(
  row: {
    verified_at: string | null;
    deferral_expires_at: string | null;
  },
  suspendAfterHours: number
): Date | null {
  if (row.deferral_expires_at) {
    return new Date(row.deferral_expires_at);
  }
  if (!row.verified_at) return null;
  return new Date(
    new Date(row.verified_at).getTime() + suspendAfterHours * 60 * 60 * 1000
  );
}
