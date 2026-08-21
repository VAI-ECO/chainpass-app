/**
 * §2 step 3 PAY — figures from settings keys, never 29/99/48 literals.
 * deno test --allow-env supabase/functions/enrol/pay_test.ts
 */
import { assertWarningBeforePay } from "../_shared/enrol-pay.ts";

Deno.test("warning must precede pay (§2.1)", () => {
  let threw = false;
  try {
    assertWarningBeforePay({ warning_acked_at: null, biometric_consent_at: "x" });
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("must refuse pay without warning");

  threw = false;
  try {
    assertWarningBeforePay({
      warning_acked_at: "x",
      biometric_consent_at: null,
    });
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("must refuse pay without consent");
});

Deno.test("enrol-pay source has no price/deferral literals 29|99|48", async () => {
  const paths = [
    new URL("../_shared/enrol-pay.ts", import.meta.url),
    new URL("../enrol-pay/index.ts", import.meta.url),
  ];
  for (const u of paths) {
    const text = await Deno.readTextFile(u);
    if (/\b29\b|\b99\b|\b48\b/.test(text)) {
      throw new Error(`literal price/window in ${u.pathname}`);
    }
  }
});
