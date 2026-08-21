/**
 * Consumption projection is computed — fails if helper shape or math breaks.
 * deno test --allow-env supabase/functions/verify/consumption_test.ts
 */
import { computeConsumptionProjection } from "../_shared/consumption.ts";

function chain(result: unknown) {
  const self: Record<string, unknown> = {};
  const methods = [
    "select",
    "eq",
    "gte",
    "order",
    "limit",
    "maybeSingle",
    "single",
  ];
  for (const m of methods) {
    self[m] = () => self;
  }
  // Terminal thenables
  self.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(result).then(resolve);
  return self;
}

Deno.test("computeConsumptionProjection burn math from live ledger window", async () => {
  const supabase = {
    from(table: string) {
      if (table === "blocks") {
        return chain({
          data: [
            { size: 100, consumed: 40 },
            { size: 50, consumed: 50 },
          ],
          error: null,
        });
      }
      if (table === "verification_ledger") {
        return chain({
          data: [{ id: 1 }, { id: 2 }, { id: 3 }],
          error: null,
        });
      }
      throw new Error(`unexpected table ${table}`);
    },
  };

  const result = await computeConsumptionProjection(supabase as never, "plat_x", 24);
  if (result.remaining !== 60) throw new Error(`remaining=${result.remaining}`);
  if (result.burned_in_window !== 3) throw new Error(`burned=${result.burned_in_window}`);
  if (result.burn_per_hour !== 3 / 24) {
    throw new Error(`burn_per_hour=${result.burn_per_hour}`);
  }
  if (!result.projected_empty_at) throw new Error("projected_empty_at required when burning");
});
