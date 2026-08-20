/**
 * Item 4: billable results exclude level_refused; ledger helper shape.
 * deno test --allow-env supabase/functions/gate/ledger_test.ts
 */
import { isBillableGateResult } from "../_shared/gate-ledger.ts";

Deno.test("every product result is billable; level_refused is not", () => {
  if (!isBillableGateResult("granted")) throw new Error("granted");
  if (!isBillableGateResult("no_match")) throw new Error("no_match");
  if (!isBillableGateResult("terms_required")) throw new Error("terms_required");
  if (!isBillableGateResult("enroll_required")) throw new Error("enroll_required");
  if (isBillableGateResult("level_refused")) throw new Error("level_refused must not bill");
  if (isBillableGateResult("block_depleted")) throw new Error("block_depleted must not re-bill");
});
