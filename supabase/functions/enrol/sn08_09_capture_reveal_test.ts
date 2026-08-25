/**
 * SN-08/09: ComplyCube secrets fail loud; embed not redirect; V.A.I. before documents.
 * deno test --allow-read --allow-env supabase/functions/enrol/sn08_09_capture_reveal_test.ts
 */
import {
  requireComplyCubeApiKey,
  assertEmbeddedProviderSession,
} from "../_shared/enrol-capture.ts";

Deno.test("SN-08 fails loud without COMPLYCUBE_API_KEY — no stub matcher", () => {
  const prev = Deno.env.get("COMPLYCUBE_API_KEY");
  Deno.env.delete("COMPLYCUBE_API_KEY");
  let threw = false;
  try {
    requireComplyCubeApiKey();
  } catch (e) {
    threw = e instanceof Error && /COMPLYCUBE_API_KEY/.test(e.message);
  } finally {
    if (prev !== undefined) Deno.env.set("COMPLYCUBE_API_KEY", prev);
  }
  if (!threw) throw new Error("missing ComplyCube secret must fail loud");
});

Deno.test("SN-08 provider session is embedded — legal name and redirect refused", () => {
  let threw = false;
  try {
    assertEmbeddedProviderSession({ redirectUrl: "https://example.invalid" });
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("redirectUrl must be refused");
  threw = false;
  try {
    assertEmbeddedProviderSession({ firstName: "Jane" });
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("firstName must be refused");
});

Deno.test("SN-08 page and function do not redirect the member away", async () => {
  const page = await Deno.readTextFile(
    new URL("../../../src/pages/EnrolCapture.tsx", import.meta.url)
  );
  const fn = await Deno.readTextFile(
    new URL("../enrol-capture/index.ts", import.meta.url)
  );
  if (!/open_provider/.test(page) || !/enrol-capture/.test(page)) {
    throw new Error("SN-08 must open the provider through enrol-capture");
  }
  if (!/cp-provider-embed/.test(page) || !/data-embed/.test(page)) {
    throw new Error("SN-08 must hold an in-page embed");
  }
  if (/window\.location\s*=/.test(page)) {
    throw new Error("SN-08 must not assign window.location");
  }
  if (/successUrl/.test(fn) || /redirectUrl/.test(fn)) {
    throw new Error("enrol-capture must not create a redirect session");
  }
  if (!/committed:\s*false/.test(fn)) {
    throw new Error("held frame must not be committed at capture");
  }
});

Deno.test("SN-09 reveal requires held capture and issues V.A.I. before requirements", async () => {
  const reveal = await Deno.readTextFile(
    new URL("../enrol-reveal/index.ts", import.meta.url)
  );
  const req = await Deno.readTextFile(
    new URL("../enrol-requirements/index.ts", import.meta.url)
  );
  if (!/held_capture_required/.test(reveal)) {
    throw new Error("reveal must require the held frame");
  }
  if (!/step:\s*8/.test(reveal)) {
    throw new Error("reveal is step 8");
  }
  if (!/vai_must_be_live_before_requirements/.test(req)) {
    throw new Error("requirements must wait for a live V.A.I.");
  }
  const page = await Deno.readTextFile(
    new URL("../../../src/pages/EnrolReveal.tsx", import.meta.url)
  );
  if (/765UT7X|94ZHD1H/.test(page)) {
    throw new Error("SN-09 must not invent a V.A.I. figure");
  }
  if (!/enrol-reveal/.test(page)) {
    throw new Error("SN-09 must write through enrol-reveal");
  }
  if (!/enrol\/register/.test(page)) {
    throw new Error("SN-09 must continue to register, not acceptance");
  }
});
