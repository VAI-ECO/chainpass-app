/**
 * Step 9 collect list from three platform-row shapes.
 * deno test --allow-read supabase/functions/enrol/step9_collection_test.ts
 */
import { step9Collects, validateRegistrationFields } from "../_shared/enrol-register.ts";

Deno.test("three platform rows — what step 9 collects", () => {
  const allThree = step9Collects({ required: ["username", "email", "phone"] });
  const nothing = step9Collects({});
  const usernameOnly = step9Collects({ required: ["username"] });
  console.log("all three:", allThree.join(" · "));
  console.log("nothing:", nothing.join(" · "));
  console.log("username only:", usernameOnly.join(" · "));
  if (allThree.join(",") !== "username,email,phone,terms and conditions") {
    throw new Error(`all three: ${allThree.join(",")}`);
  }
  if (nothing.join(",") !== "email or phone,terms and conditions") {
    throw new Error(`nothing: ${nothing.join(",")}`);
  }
  if (usernameOnly.join(",") !== "username,email or phone,terms and conditions") {
    throw new Error(`username only: ${usernameOnly.join(",")}`);
  }
});

Deno.test("floor still applies when the platform requires username only", () => {
  let threw = false;
  try {
    validateRegistrationFields(
      { username: "neo", terms_accepted: true },
      { required: ["username"] }
    );
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("username only must still require email or phone");
  const r = validateRegistrationFields(
    { username: "neo", email: "a@b.c", terms_accepted: true },
    { required: ["username"] }
  );
  if (r.username !== "neo" || r.email !== "a@b.c") throw new Error("username + floor");
});

Deno.test("nothing on the platform row still takes the floor plus terms", () => {
  let threw = false;
  try {
    validateRegistrationFields({ email: "a@b.c" }, {});
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("terms are the floor");
  const r = validateRegistrationFields(
    { email: "a@b.c", terms_accepted: true },
    {}
  );
  if (r.email !== "a@b.c") throw new Error("floor email");
});
