/**
 * SN-01–07: query token refused; pay keys; consent before capture; no legal name; deferral gated.
 * deno test --allow-read supabase/functions/enrol/sn01_07_screens_test.ts
 */
async function read(rel: string): Promise<string> {
  return await Deno.readTextFile(new URL(rel, import.meta.url));
}

Deno.test("SN-01: token never constructed as a query parameter", async () => {
  const entry = await read("../../../src/pages/EnrolEntry.tsx");
  const enrol = await read("../enrol/index.ts");
  if (!/QUERY_FORBIDDEN/.test(entry)) {
    throw new Error("EnrolEntry must refuse query token keys");
  }
  if (/\?token=|\?enrolment_token=|\?platform=/.test(entry)) {
    throw new Error("EnrolEntry must not put token or platform in a query string");
  }
  if (!/enrolment_step:\s*1/.test(enrol) || !/step:\s*1/.test(enrol)) {
    throw new Error("enrol must open sessions at step 1");
  }
});

Deno.test("SN-02 warning copy is §2.1 keep-split, and SN-02 writes nothing", async () => {
  const keep = await read("../../../src/pages/EnrolKeep.tsx");
  if (!/ChainPass keeps your face/.test(keep)) {
    throw new Error("SN-02 must carry the §2.1 warning copy");
  }
  if (/invokeEnrol|functions\.invoke/.test(keep)) {
    throw new Error("SN-02 writes none — must not call a function");
  }
  if (/Pay and continue|enrol-pay/.test(keep)) {
    throw new Error("SN-02 must not pay");
  }
});

Deno.test("SN-03 consent is recorded before any capture call", async () => {
  const consent = await read("../enrol-consent/index.ts");
  const capture = await read("../enrol-capture/index.ts");
  if (!/biometric_consent_required/.test(consent)) {
    throw new Error("enrol-consent must require biometric consent");
  }
  if (!/held_capture/.test(consent) || !/capture_already_exists_consent_too_late/.test(consent)) {
    throw new Error("consent after capture must be refused");
  }
  if (!/biometric_consent_required_first/.test(capture)) {
    throw new Error("enrol-capture must refuse without prior consent");
  }
  const page = await read("../../../src/pages/EnrolConsent.tsx");
  if (!/enrol-consent/.test(page) || !/consent_biometric:\s*true/.test(page)) {
    throw new Error("SN-03 must POST enrol-consent with consent_biometric true");
  }
  if (!/warning_acknowledged:\s*true/.test(page)) {
    throw new Error("SN-03 must acknowledge the §2.1 warning with consent");
  }
});

Deno.test("SN-04 prices come only from settings.price_vai / price_vai_pro", async () => {
  const pay = await read("../_shared/enrol-pay.ts");
  const page = await read("../../../src/pages/EnrolPay.tsx");
  if (!/getSettingNumber\(supabase,\s*"price_vai"\)/.test(pay)) {
    throw new Error("quote must read settings.price_vai");
  }
  if (!/getSettingNumber\(supabase,\s*"price_vai_pro"\)/.test(pay)) {
    throw new Error("quote must read settings.price_vai_pro");
  }
  if (/price_access|price_vai_standard/.test(pay) || /price_access|price_vai_standard/.test(page.replace(/price_access is a pointer/, ""))) {
    throw new Error("unruled price_access must not be a payable key");
  }
  if (/\b29\b|\b99\b/.test(pay)) {
    throw new Error("price literals in enrol-pay");
  }
});

Deno.test("SN-05 deferral only when platform_agreements.deferral_offered", async () => {
  const pay = await read("../_shared/enrol-pay.ts");
  const page = await read("../../../src/pages/EnrolPay.tsx");
  if (!/deferral_offered === true/.test(pay)) {
    throw new Error("deferral must be gated on platform_agreements.deferral_offered");
  }
  if (!/quote\?\.deferral/.test(page)) {
    throw new Error("pay screen must not offer deferral unless the quote includes it");
  }
  if (!/deferral_not_offered_by_platform/.test(await read("../enrol-pay/index.ts"))) {
    throw new Error("enrol-pay must refuse defer when the platform did not offer it");
  }
});

Deno.test("SN-06 register is contact — username only when the spec asks", async () => {
  const page = await read("../../../src/pages/EnrolRegister.tsx");
  const shared = await read("../_shared/enrol-register.ts");
  if (/legal_name|full_name|first_name|last_name|given_name/.test(page)) {
    throw new Error("SN-06 must not collect legal name");
  }
  if (!/Email or phone/.test(page)) {
    throw new Error("SN-06 must collect email or phone");
  }
  if (/username is mandatory/.test(shared)) {
    throw new Error("username must not be ChainPass-mandatory");
  }
  if (!/Step 4 of 13/.test(page)) {
    throw new Error("register step label must be 4 of 13");
  }
  if (!/enrol-register/.test(page)) {
    throw new Error("SN-06 must write through enrol-register");
  }
});

Deno.test("SN-07 OTP is control before provider", async () => {
  const otp = await read("../enrol-otp/index.ts");
  const capture = await read("../enrol-capture/index.ts");
  if (!/otp_verified_at/.test(otp) || !/enrolment_step.*5/.test(otp)) {
    throw new Error("enrol-otp must stamp step 5");
  }
  if (/!session\.username/.test(otp)) {
    throw new Error("OTP must not require username after CP-03");
  }
  if (!/otp_required_before_provider/.test(capture)) {
    throw new Error("capture/provider must not run before OTP");
  }
  const page = await read("../../../src/pages/EnrolOtp.tsx");
  if (!/enrol-otp/.test(page)) {
    throw new Error("SN-07 must write through enrol-otp");
  }
  if (/\b\d{4,8}\b/.test(page) && !/unruled/.test(page)) {
    throw new Error("OTP length must not be invented");
  }
});

Deno.test("§2 step order in App routes matches canon 1–5 then capture", async () => {
  const app = await read("../../../src/App.tsx");
  const order = [
    'path="/enrol"',
    'path="/enrol/keep"',
    'path="/enrol/consent"',
    'path="/enrol/pay"',
    'path="/enrol/register"',
    'path="/enrol/otp"',
  ];
  let last = -1;
  for (const p of order) {
    const i = app.indexOf(p);
    if (i < 0) throw new Error(`missing route ${p}`);
    if (i < last) throw new Error(`route order broken at ${p}`);
    last = i;
  }
});
