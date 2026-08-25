import { refuseUnpaid, PAY_REQUIRED } from "../_shared/require-paid.ts";

Deno.test("unpaid session is refused", () => {
  const refused = refuseUnpaid({ paid_at: null });
  if (!refused || refused.error !== PAY_REQUIRED) {
    throw new Error("unpaid must return pay_required");
  }
});

Deno.test("paid session is not refused", () => {
  if (refuseUnpaid({ paid_at: "2026-08-25T00:00:00Z" }) !== null) {
    throw new Error("paid must pass");
  }
});
