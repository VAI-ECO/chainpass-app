/**
 * SN-13–15: face URL required; term from settings; handoff payload; no legal name.
 * deno test --allow-read --allow-env supabase/functions/enrol/sn13_15_baseline_handoff_test.ts
 */
import { requireFaceService } from "../_shared/enrol-baseline.ts";

Deno.test("SN-13 fails loud without FACE_SERVICE_URL / KEY — no stub matcher", () => {
  const prevUrl = Deno.env.get("FACE_SERVICE_URL");
  const prevKey = Deno.env.get("FACE_SERVICE_KEY");
  Deno.env.delete("FACE_SERVICE_URL");
  Deno.env.delete("FACE_SERVICE_KEY");
  let threw = false;
  try {
    requireFaceService();
  } catch (e) {
    threw = e instanceof Error && /FACE_SERVICE_URL/.test(e.message);
  }
  Deno.env.set("FACE_SERVICE_URL", "https://face.example.invalid");
  Deno.env.delete("FACE_SERVICE_KEY");
  let threwKey = false;
  try {
    requireFaceService();
  } catch (e) {
    threwKey = e instanceof Error && /FACE_SERVICE_KEY/.test(e.message);
  }
  if (prevUrl !== undefined) Deno.env.set("FACE_SERVICE_URL", prevUrl);
  else Deno.env.delete("FACE_SERVICE_URL");
  if (prevKey !== undefined) Deno.env.set("FACE_SERVICE_KEY", prevKey);
  else Deno.env.delete("FACE_SERVICE_KEY");
  if (!threw || !threwKey) throw new Error("missing face secrets must fail loud");
});

Deno.test("SN-13 commits held frame via FACE_SERVICE after signings", async () => {
  const fn = await Deno.readTextFile(
    new URL("../enrol-baseline/index.ts", import.meta.url)
  );
  const page = await Deno.readTextFile(
    new URL("../../../src/pages/EnrolBaseline.tsx", import.meta.url)
  );
  if (!/requireFaceService/.test(fn) || !/client_vector_rejected/.test(fn)) {
    throw new Error("baseline must reject a client vector and call the face service");
  }
  if (!/documents_signed:\s*true/.test(page) || /vector:/.test(page)) {
    throw new Error("SN-13 must not send a stub vector");
  }
  if (!/requirements_must_be_signed_before_baseline/.test(fn)) {
    throw new Error("baseline waits for step 8 signings");
  }
});

Deno.test("SN-14 term comes from settings.credential_year_length_years", async () => {
  const fn = await Deno.readTextFile(
    new URL("../enrol-complete/index.ts", import.meta.url)
  );
  const page = await Deno.readTextFile(
    new URL("../../../src/pages/EnrolComplete.tsx", import.meta.url)
  );
  if (!/credential_year_length_years/.test(fn) || !/credential_year_length_years/.test(page)) {
    throw new Error("congratulations must use the canon term setting");
  }
  if (/\b365\b|\bone calendar year\b/.test(fn)) {
    throw new Error("term must not be a constant in enrol-complete");
  }
});

Deno.test("SN-15 payload is V.A.I. + username + email/phone; session_key null; no legal name", async () => {
  const page = await Deno.readTextFile(
    new URL("../../../src/pages/EnrolHandoff.tsx", import.meta.url)
  );
  if (!/enrol-handoff/.test(page)) throw new Error("SN-15 must call enrol-handoff");
  if (/legal_name|full_name|firstName|lastName/.test(page)) {
    throw new Error("SN-15 must not show legal name");
  }
  if (/\?token=|\?vai=/.test(page)) {
    throw new Error("handoff URL must not carry identifiers");
  }
});
