/**
 * deno test --allow-env supabase/functions/enrol/register_test.ts
 */
import {
  assertNoLegalNameFields,
  validateRegistrationFields,
} from "../_shared/enrol-register.ts";

Deno.test("rejects legal name fields", () => {
  let threw = false;
  try {
    assertNoLegalNameFields({ username: "a", legal_name: "Jane Doe" });
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("expected legal_name reject");
});

Deno.test("contact alone is enough — username is not ChainPass's requirement", () => {
  const r = validateRegistrationFields(
    { email: "a@b.c", terms_accepted: true },
    null
  );
  if (r.email !== "a@b.c") throw new Error("email");
  if (r.username !== null) throw new Error("username must be optional");
  let threw = false;
  try {
    validateRegistrationFields({}, null);
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("expected at_least_one fail");
});

Deno.test("username required only when collection_fields.required includes it", () => {
  let threw = false;
  try {
    validateRegistrationFields(
      { email: "a@b.c" },
      { required: ["username"] }
    );
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("expected username required when spec says so");
  const r = validateRegistrationFields(
    { username: "neo", email: "a@b.c", terms_accepted: true },
    { required: ["username"] }
  );
  if (r.username !== "neo") throw new Error("username from spec");
});

Deno.test("full_name field name forbidden", () => {
  let threw = false;
  try {
    validateRegistrationFields(
      { email: "a@b.c", full_name: "Nope" },
      null
    );
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("full_name must fail");
});
