/**
 * Item 1 verify: level-1 agreement refused on level-2 endpoint; level-3 passes.
 * deno test --allow-env supabase/functions/gate/level_check_test.ts
 */
import { agreementMeetsEndpointLevel } from "../_shared/gate-level.ts";

Deno.test("§14.1: level-1 key on level-2 endpoint is refused", () => {
  if (agreementMeetsEndpointLevel(1, 2) !== false) {
    throw new Error("expected level-1 < level-2 to refuse");
  }
});

Deno.test("§14.1: level-3 key passes level-1, level-2, and level-3 endpoints", () => {
  if (!agreementMeetsEndpointLevel(3, 1)) throw new Error("3>=1");
  if (!agreementMeetsEndpointLevel(3, 2)) throw new Error("3>=2");
  if (!agreementMeetsEndpointLevel(3, 3)) throw new Error("3>=3");
});

Deno.test("§14.1: equal levels pass", () => {
  if (!agreementMeetsEndpointLevel(2, 2)) throw new Error("2>=2");
});
