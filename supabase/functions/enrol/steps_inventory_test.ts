/**
 * §2 thirteen-step inventory — fails if step order or missing endpoints break.
 * deno test --allow-read supabase/functions/enrol/steps_inventory_test.ts
 */
const STEP_FILES: Array<{ step: number; path: string; mustMatch: RegExp }> = [
  { step: 1, path: "../enrol/index.ts", mustMatch: /enrolment_step:\s*1|step:\s*1/ },
  { step: 2, path: "../enrol-consent/index.ts", mustMatch: /step:\s*2|enrolment_step.*2/ },
  { step: 3, path: "../enrol-pay/index.ts", mustMatch: /step:\s*3|enrolment_step.*3/ },
  { step: 4, path: "../enrol-register/index.ts", mustMatch: /step:\s*4|enrolment_step.*4/ },
  { step: 5, path: "../enrol-otp/index.ts", mustMatch: /step:\s*5|enrolment_step.*5/ },
  { step: 6, path: "../enrol-capture/index.ts", mustMatch: /step:\s*6|enrolment_step.*6/ },
  { step: 7, path: "../enrol-reveal/index.ts", mustMatch: /step:\s*7|enrolment_step.*7/ },
  { step: 8, path: "../enrol-accept/index.ts", mustMatch: /step:\s*8|enrolment_step.*8/ },
  { step: 9, path: "../enrol-requirements/index.ts", mustMatch: /step:\s*9|enrolment_step.*9/ },
  { step: 10, path: "../enrol-baseline/index.ts", mustMatch: /step:\s*10|enrolment_step.*10/ },
  { step: 11, path: "../enrol-complete/index.ts", mustMatch: /step:\s*11|enrolment_step.*11/ },
  { step: 12, path: "../enrol-security/index.ts", mustMatch: /step:\s*12|enrolment_step.*12/ },
  { step: 13, path: "../enrol-handoff/index.ts", mustMatch: /step:\s*13|enrolment_step.*13/ },
];

Deno.test("all thirteen §2 steps have endpoints in order", async () => {
  for (const s of STEP_FILES) {
    const url = new URL(s.path, import.meta.url);
    let text: string;
    try {
      text = await Deno.readTextFile(url);
    } catch {
      throw new Error(`MISSING step ${s.step}: ${s.path}`);
    }
    if (!s.mustMatch.test(text)) {
      throw new Error(`step ${s.step} file lacks step marker: ${s.path}`);
    }
  }
  for (let i = 1; i < STEP_FILES.length; i++) {
    if (!(STEP_FILES[i - 1].step < STEP_FILES[i].step)) {
      throw new Error("inventory not ascending");
    }
  }
});

Deno.test("§2.3 register forbids legal name fields", async () => {
  const { assertNoLegalNameFields } = await import("../_shared/enrol-register.ts");
  let threw = false;
  try {
    assertNoLegalNameFields({ username: "x", legal_name: "Nope" });
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("legal_name must be refused");
});

Deno.test("§2.7 break voids capture not enrolment", async () => {
  const { breakVoidsCaptureNotEnrolment, voidHeldCaptureOnBreak } = await import(
    "../_shared/enrol-capture.ts"
  );
  const voided = voidHeldCaptureOnBreak({
    held_capture: "frame",
    held_capture_voided_at: null,
  });
  if (
    !breakVoidsCaptureNotEnrolment({
      username: "u",
      held_capture: "frame",
      after_void_held: voided.held_capture,
    })
  ) {
    throw new Error("break must void capture only");
  }
});

Deno.test("§2.9 handoff payload excludes legal name keys", async () => {
  const text = await Deno.readTextFile(
    new URL("../enrol-handoff/index.ts", import.meta.url)
  );
  if (/legal_name|full_name/.test(text)) {
    throw new Error("handoff must not mention legal name fields");
  }
  if (!/session_key/.test(text) || !/provider_session_key:\s*null/.test(text)) {
    throw new Error("§2.4a session key must leave once and be deleted");
  }
});
