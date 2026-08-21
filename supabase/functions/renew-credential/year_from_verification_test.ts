/**
 * Year advances from verified_at — payment timestamp never enters the update.
 * deno test --allow-env supabase/functions/renew-credential/year_from_verification_test.ts
 */
import { advanceCredentialYearFromVerification } from "../_shared/renewal-ops.ts";

function chain(result: unknown) {
  const self: Record<string, unknown> = {};
  for (const m of ["select", "eq", "update", "single"]) {
    self[m] = (..._args: unknown[]) => self;
  }
  self.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(result).then(resolve);
  return self;
}

Deno.test("advanceCredentialYearFromVerification writes verified_at as year_starts_at", async () => {
  const captured: { payload: Record<string, unknown> | null } = { payload: null };
  const supabase = {
    from(table: string) {
      if (table === "settings") {
        return chain({ data: { value: "1" }, error: null });
      }
      if (table === "credentials") {
        const c = chain({ error: null });
        c.update = (p: unknown) => {
          captured.payload = p as Record<string, unknown>;
          return c;
        };
        return c;
      }
      throw new Error(`unexpected ${table}`);
    },
  };

  const verified = new Date("2026-08-21T12:00:00.000Z");
  await advanceCredentialYearFromVerification(
    supabase as never,
    "ABCDEFG",
    verified
  );

  const updatePayload = captured.payload;
  if (!updatePayload) throw new Error("credentials.update not called");
  if (String(updatePayload["year_starts_at"]) !== verified.toISOString()) {
    throw new Error("year_starts_at must equal verified_at");
  }
  if (String(updatePayload["verified_at"]) !== verified.toISOString()) {
    throw new Error("verified_at must be set from verification moment");
  }
  if (Object.prototype.hasOwnProperty.call(updatePayload, "paid_at")) {
    throw new Error("paid_at must not appear on year advance");
  }
});
