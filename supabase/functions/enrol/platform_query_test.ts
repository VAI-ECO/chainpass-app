/**
 * Item 1: ?platform= refused; token path has no platform query.
 * deno test --allow-env supabase/functions/enrol/platform_query_test.ts
 */
import { requestHasPlatformQuery } from "../_shared/refuse-platform-query.ts";

Deno.test("detects platform and platform_id query keys", () => {
  if (!requestHasPlatformQuery(new URL("https://x/enrol?platform=vairify"))) {
    throw new Error("platform=");
  }
  if (!requestHasPlatformQuery(new URL("https://x/enrol?platform_id=abc"))) {
    throw new Error("platform_id=");
  }
  if (requestHasPlatformQuery(new URL("https://x/enrol?session_id=abc"))) {
    throw new Error("session_id alone must be allowed");
  }
  if (requestHasPlatformQuery(new URL("https://x/enrol"))) {
    throw new Error("bare path must be allowed");
  }
});
