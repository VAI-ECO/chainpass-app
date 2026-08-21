/**
 * Item 1: ?platform= / ?token= refused; token path has no query secrets.
 * deno test --allow-env supabase/functions/enrol/platform_query_test.ts
 */
import {
  requestHasPlatformQuery,
  refusePlatformQuery,
} from "../_shared/refuse-platform-query.ts";

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

Deno.test("§2.5 refuses ?token= and ?enrolment_token=", () => {
  const tokenReq = new Request("https://x/enrol?token=abc.sig", { method: "POST" });
  const refused = refusePlatformQuery(tokenReq);
  if (refused?.status !== 400) throw new Error("?token= must be refused");

  const enrolTokenReq = new Request(
    "https://x/enrol?enrolment_token=abc.sig",
    { method: "POST" }
  );
  if (refusePlatformQuery(enrolTokenReq)?.status !== 400) {
    throw new Error("?enrolment_token= must be refused");
  }
});
