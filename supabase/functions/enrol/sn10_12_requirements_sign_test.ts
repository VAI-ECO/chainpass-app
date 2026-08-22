/**
 * SN-10–12: LE is a declaration; view-and-sign bind; no invented subtype.
 * deno test --allow-read supabase/functions/enrol/sn10_12_requirements_sign_test.ts
 */
import { assertAgreementSubtype } from "../_shared/agreement-version.ts";
import { bindShownToCurrent } from "../_shared/agreement-version.ts";

Deno.test("LE is a declaration, not an agreement_versions subtype", () => {
  let threw = false;
  try {
    assertAgreementSubtype("le_declaration");
  } catch (e) {
    threw = e instanceof Error && e.message === "le_is_declaration_not_agreement_subtype";
  }
  if (!threw) throw new Error("le_declaration must not be a subtype");
  assertAgreementSubtype("contract");
  assertAgreementSubtype("terms");
});

Deno.test("shown body id is the stamped id — stale_document if not", () => {
  const ok = bindShownToCurrent("ver-saw-this", "ver-saw-this");
  if (!ok.ok || ok.agreement_version_id !== "ver-saw-this") {
    throw new Error("matching ids must stamp");
  }
  const stale = bindShownToCurrent("ver-saw-this", "ver-other");
  if (stale.ok || stale.error !== "stale_document") {
    throw new Error("mismatch must be stale_document");
  }
});

Deno.test("SN-10/11 write through enrol-requirements; LE never as subtype in pages", async () => {
  const req = await Deno.readTextFile(
    new URL("../enrol-requirements/index.ts", import.meta.url)
  );
  const listPage = await Deno.readTextFile(
    new URL("../../../src/pages/EnrolRequirements.tsx", import.meta.url)
  );
  const lePage = await Deno.readTextFile(
    new URL("../../../src/pages/EnrolDeclaration.tsx", import.meta.url)
  );
  const signPage = await Deno.readTextFile(
    new URL("../../../src/pages/EnrolSign.tsx", import.meta.url)
  );
  if (!/quote_only/.test(req) || !/quote_only:\s*true/.test(listPage)) {
    throw new Error("SN-10 must quote requirements without inventing outcomes");
  }
  if (!/law_enforcement_declared/.test(req) || !/law_enforcement_declared:\s*true/.test(lePage)) {
    throw new Error("SN-11 must declare LE through enrol-requirements");
  }
  if (/subtype:\s*["']le/.test(lePage) || /subtype:\s*["']le/.test(signPage)) {
    throw new Error("pages must not send LE as an agreement subtype");
  }
  if (!/le_is_declaration_not_agreement_subtype/.test(req)) {
    throw new Error("enrol-requirements must refuse LE as a subtype");
  }
});

Deno.test("SN-12 views via agreement-version and signs with shown_version_id", async () => {
  const signPage = await Deno.readTextFile(
    new URL("../../../src/pages/EnrolSign.tsx", import.meta.url)
  );
  if (!/agreement-version/.test(signPage) || !/sign-contract/.test(signPage)) {
    throw new Error("SN-12 must view then sign");
  }
  if (!/shown_version_id/.test(signPage)) {
    throw new Error("SN-12 must report shown_version_id");
  }
  if (/agreement_version_id:/.test(signPage) && /invokeEnrol\("sign-contract"/.test(signPage)) {
    const signCall = signPage.slice(signPage.indexOf('invokeEnrol("sign-contract"'));
    const block = signCall.slice(0, 400);
    if (/agreement_version_id:/.test(block)) {
      throw new Error("client must not choose agreement_version_id at sign");
    }
  }
});
