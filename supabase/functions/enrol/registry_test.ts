/**
 * SPEC-CP-02 registry surfaces and one-way door.
 * deno test --allow-read supabase/functions/enrol/registry_test.ts
 */
import { mintAgreementId } from "../_shared/registry.ts";

Deno.test("§14.6 lists register fetch retire open display record search", async () => {
  const canon = await Deno.readTextFile(
    new URL("../../../docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md", import.meta.url)
  );
  const spec = await Deno.readTextFile(
    new URL("../../../docs/SPEC-CP-02_THE_CONTRACT_REGISTRY__v3-8-25_.md", import.meta.url)
  );
  if (!/register · fetch · retire · open · display · record · search/.test(canon)) {
    throw new Error("CANON-CP-01 §14.6 missing registry surface list");
  }
  if (!/Gains a registry surface/.test(spec)) {
    throw new Error("SPEC-CP-02 must name the surface");
  }
  const idx = await Deno.readTextFile(
    new URL("../registry/index.ts", import.meta.url)
  );
  for (const a of ["register", "fetch", "retire", "open", "display", "record", "search"]) {
    if (!idx.includes(`action === "${a}"`)) throw new Error(`missing action ${a}`);
  }
});

Deno.test("open returns agreement_id and no contract text", async () => {
  const src = await Deno.readTextFile(
    new URL("../_shared/registry.ts", import.meta.url)
  );
  const fn = src.slice(src.indexOf("export async function openAgreement"));
  const end = fn.indexOf("export async function displayContract");
  const body = end > 0 ? fn.slice(0, end) : fn;
  if (!/agreement_id/.test(body)) throw new Error("must mint agreement_id");
  if (/body:/.test(body) && /return \{[\s\S]*body/.test(body)) {
    throw new Error("open must not return contract body");
  }
  if (!/draft_never_served/.test(body)) throw new Error("draft refused");
  if (!/retired_refused_at_open/.test(body)) throw new Error("retired refused at open");
});

Deno.test("agreement id shape AG- plus 26", () => {
  const id = mintAgreementId();
  if (!/^AG-[A-Z0-9]{26}$/.test(id)) throw new Error(id);
});
