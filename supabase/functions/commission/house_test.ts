/**
 * House origination (null originator) skips commission — real accrueCommission path.
 * deno test --allow-env supabase/functions/commission/house_test.ts
 */
import { accrueCommission } from "../_shared/commission.ts";

Deno.test("null originating_platform_id skips commission (house)", async () => {
  const supabase = {
    from(table: string) {
      if (table === "credentials") {
        return {
          select() {
            return {
              eq() {
                return {
                  maybeSingle() {
                    return Promise.resolve({
                      data: { originating_platform_id: null },
                      error: null,
                    });
                  },
                };
              },
            };
          },
        };
      }
      throw new Error(`unexpected table ${table} — house path must not write ledger`);
    },
  };

  const result = await accrueCommission(supabase as never, {
    platform_id: "any",
    vai: "ABCDEFG",
    event: "origination",
  });
  if (!("skipped" in result) || result.skipped !== "house_no_commission") {
    throw new Error(`expected house_no_commission, got ${JSON.stringify(result)}`);
  }
});
