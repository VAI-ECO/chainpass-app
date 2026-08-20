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

Deno.test("username + at least one of email|phone", () => {
  const r = validateRegistrationFields(
    { username: "neo", email: "a@b.c" },
    null
  );
  if (r.username !== "neo" || r.email !== "a@b.c") throw new Error("fields");
  let threw = false;
  try {
    validateRegistrationFields({ username: "neo" }, null);
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("expected at_least_one fail");
});

Deno.test("full_name field name forbidden", () => {
  let threw = false;
  try {
    validateRegistrationFields(
      { username: "x", email: "a@b.c", full_name: "Nope" },
      null
    );
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("full_name must fail");
});
