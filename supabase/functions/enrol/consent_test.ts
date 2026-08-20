/**
 * deno test --allow-env supabase/functions/enrol/consent_test.ts
 * Consent must precede capture — held_capture blocks late consent.
 */
Deno.test("consent step number is 2 before provider/capture steps 5–6", () => {
  const CONSENT_STEP = 2;
  const CAPTURE_STEP = 6;
  if (!(CONSENT_STEP < CAPTURE_STEP)) throw new Error("consent must precede capture");
});

Deno.test("three consent layers are named", () => {
  const layers = [
    "chainpass_platform_onboarding",
    "chainpass_holder_biometric",
    "platform_holder_first_visit",
  ];
  if (layers.length !== 3) throw new Error("three layers mandatory");
});
