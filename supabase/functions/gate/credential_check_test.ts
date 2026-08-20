/**
 * Item 2: credential active + level; enrol token carries platform_id, not query.
 * deno test --allow-env supabase/functions/gate/credential_check_test.ts
 */
import {
  credentialIsActive,
  credentialMeetsRequiredLevel,
} from "../_shared/gate-credential.ts";
import {
  signEnrolmentToken,
  verifyEnrolmentToken,
} from "../_shared/enrolment-token.ts";

Deno.env.set("ENROLMENT_TOKEN_SECRET", "test-enrolment-secret-item2");

Deno.test("active states pass; suspended fails", () => {
  if (!credentialIsActive("active")) throw new Error("active");
  if (!credentialIsActive("expiring")) throw new Error("expiring");
  if (credentialIsActive("suspended")) throw new Error("suspended should fail");
  if (credentialIsActive("banned")) throw new Error("banned should fail");
});

Deno.test("credential_level ≥ required_level one integer comparison", () => {
  if (!credentialMeetsRequiredLevel(2, 2)) throw new Error("2>=2");
  if (!credentialMeetsRequiredLevel(3, 1)) throw new Error("3>=1");
  if (credentialMeetsRequiredLevel(1, 2)) throw new Error("1>=2 should fail");
  if (credentialMeetsRequiredLevel(null, 1)) throw new Error("null should fail");
});

Deno.test("§2.5 enrolment token embeds platform_id; not a query string", async () => {
  const token = await signEnrolmentToken("plat_alpha");
  if (token.includes("?")) throw new Error("token must not look like a query");
  if (token.includes("platform=")) throw new Error("platform must not be plain in token text as query");
  const payload = await verifyEnrolmentToken(token);
  if (payload.platform_id !== "plat_alpha") throw new Error("platform_id mismatch");
  if (payload.purpose !== "enrol") throw new Error("purpose");
});
