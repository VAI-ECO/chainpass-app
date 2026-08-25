/**
 * CANON-CP-02 §1 enrolment_step map.
 * deno test --allow-read supabase/functions/enrol/steps_inventory_test.ts
 */
const STEP_FILES: Array<{ step: string; path: string; mustMatch: RegExp }> = [
  { step: "1", path: "../enrol/index.ts", mustMatch: /enrolment_step:\s*1/ },
  { step: "2", path: "../enrol-pay/index.ts", mustMatch: /step:\s*2|pay_step:\s*2/ },
  { step: "3", path: "../enrol-pay/index.ts", mustMatch: /generateSessionKey|enrolment_step.*3/ },
  { step: "4", path: "../enrol-capture/index.ts", mustMatch: /step:\s*4/ },
  { step: "5", path: "../enrol-capture/index.ts", mustMatch: /baseline_step:\s*5/ },
  { step: "6", path: "../enrol-capture/index.ts", mustMatch: /kyc_step:\s*6/ },
  { step: "7", path: "../enrol-capture/index.ts", mustMatch: /step:\s*7/ },
  { step: "8", path: "../enrol-reveal/index.ts", mustMatch: /step:\s*8/ },
  { step: "9", path: "../enrol-register/index.ts", mustMatch: /step:\s*9/ },
  { step: "9-otp", path: "../enrol-otp/index.ts", mustMatch: /step:\s*9/ },
  { step: "10-docs", path: "../enrol-accept/index.ts", mustMatch: /step:\s*10/ },
  { step: "10-match", path: "../enrol-baseline/index.ts", mustMatch: /step:\s*10/ },
  { step: "11", path: "../enrol-security/index.ts", mustMatch: /enrolment_step.*11|step:\s*11/ },
  { step: "11a", path: "../../../src/pages/EnrolFinal.tsx", mustMatch: /Step 11a/ },
  { step: "12", path: "../enrol-handoff/index.ts", mustMatch: /handoff_step:\s*12|step:\s*12/ },
  { step: "13", path: "../enrol-handoff/index.ts", mustMatch: /enrolment_step:\s*13/ },
];

Deno.test("CANON-CP-02 §1 map: thirteen steps plus 11a", async () => {
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
});

Deno.test("register and otp sit after reveal in App routes", async () => {
  const app = await Deno.readTextFile(
    new URL("../../../src/App.tsx", import.meta.url)
  );
  const capture = app.indexOf('path="/enrol/capture"');
  const reveal = app.indexOf('path="/enrol/reveal"');
  const register = app.indexOf('path="/enrol/register"');
  const otp = app.indexOf('path="/enrol/otp"');
  if (capture < 0 || reveal < 0 || register < 0 || otp < 0) {
    throw new Error("missing enrol routes");
  }
  if (!(capture < reveal && reveal < register && register < otp)) {
    throw new Error("App route order must be capture → reveal → register → otp");
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

Deno.test("handoff S2S payload carries session_key then deletes it", async () => {
  const text = await Deno.readTextFile(
    new URL("../enrol-handoff/index.ts", import.meta.url)
  );
  if (/legal_name|full_name/.test(text)) {
    throw new Error("handoff must not mention legal name fields");
  }
  if (!/serverToServerPayload/.test(text)) {
    throw new Error("handoff must build the server-to-server payload");
  }
  if (!/session_key:\s*null/.test(text) || !/provider_session_key:\s*null/.test(text)) {
    throw new Error("step 13 must delete the session key after the POST");
  }
});
