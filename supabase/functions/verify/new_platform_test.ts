import { newPlatformEarnsNothingOnVerify } from "../_shared/consumption-origination.ts";

Deno.test("new platform verify writes zero commission rows", () => {
  const ok = newPlatformEarnsNothingOnVerify({
    verifying_platform_id: "plat_b",
    originating_platform_id: "plat_a",
    commission_rows_written: 0,
  });
  if (!ok) throw new Error("must earn nothing");
});
