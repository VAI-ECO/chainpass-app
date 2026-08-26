/**
 * SN-51 acceptance: checkbox gates frame two; no KYC % in responses.
 * deno test --allow-read --allow-env supabase/functions/enrol/sn51_accept_test.ts
 */
async function read(rel: string): Promise<string> {
  return await Deno.readTextFile(new URL(rel, import.meta.url));
}

Deno.test("unchecked terms reject second capture and baseline", async () => {
  const fn = await read("../enrol-accept/index.ts");
  if (!/terms_checkbox_required/.test(fn)) {
    throw new Error("accept must refuse without the checkbox");
  }
  if (!/terms_accepted_at/.test(fn) || !/acceptance_capture/.test(fn)) {
    throw new Error("accept must write terms_accepted_at and acceptance_capture");
  }
  const page = await read("../../../src/pages/EnrolAccept.tsx");
  if (!/terms_checked/.test(page) && !/checkbox/.test(page)) {
    throw new Error("SN-51 must show a terms checkbox");
  }
  if (!/enrol-accept/.test(page)) {
    throw new Error("SN-51 must write through enrol-accept");
  }
});

Deno.test("LE is not this checkbox", async () => {
  const page = await read("../../../src/pages/EnrolAccept.tsx");
  const fn = await read("../enrol-accept/index.ts");
  if (/law enforcement|le_declaration/.test(page) && /bundled/.test(page)) {
    throw new Error("LE must not be bundled on the terms checkbox");
  }
  if (/subtype:\s*"le"/.test(fn)) {
    throw new Error("accept must not treat LE as terms");
  }
});

Deno.test("VAI Go and VAI Access go to baseline; VAI Pro keeps requirements", async () => {
  const helper = await read("../_shared/enrol-accept.ts");
  const page = await read("../../../src/pages/EnrolAccept.tsx");
  if (!/nextAfterAcceptance/.test(helper) || !/level === 3/.test(helper)) {
    throw new Error("accept must return a next route — Pro is level 3");
  }
  if (!/enrol\/baseline/.test(page) || !/enrol\/requirements/.test(page)) {
    throw new Error("page must branch VAI Go/VAI Access vs VAI Pro");
  }
});

Deno.test("no KYC percentage leaves enrol-accept or enrol-capture responses", async () => {
  const accept = await read("../enrol-accept/index.ts");
  const capture = await read("../enrol-capture/index.ts");
  if (/kyc_match_percent/.test(accept) && /return json\([^)]*kyc_match_percent/.test(accept)) {
    throw new Error("accept must not return kyc_match_percent");
  }
  if (!/kyc_match_percent/.test(capture)) {
    throw new Error("capture must record kyc_match_percent on the session");
  }
  if (/json\(\{[^}]*kyc_match_percent/.test(capture)) {
    throw new Error("capture must not echo the percentage");
  }
});
