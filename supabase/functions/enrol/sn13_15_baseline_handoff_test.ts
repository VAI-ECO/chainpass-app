/**
 * SN-13: two frames + terms; SN-14 term setting; SN-15 handoff payload.
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

Deno.test("SN-13 requires both frames and terms checkbox; no invented merge", async () => {
  const fn = await Deno.readTextFile(
    new URL("../enrol-baseline/index.ts", import.meta.url)
  );
  const page = await Deno.readTextFile(
    new URL("../../../src/pages/EnrolBaseline.tsx", import.meta.url)
  );
  if (!/requireFaceService/.test(fn) || !/client_vector_rejected/.test(fn)) {
    throw new Error("baseline must reject a client vector and call the face service");
  }
  if (!/terms_accepted_at/.test(fn)) {
    throw new Error("baseline requires the terms checkbox");
  }
  if (!/acceptance_capture/.test(fn) || !/held_capture/.test(fn)) {
    throw new Error("baseline requires both frames");
  }
  if (!/acceptance_capture_missing_or_voided/.test(fn)) {
    throw new Error("must reject baseline without frame two");
  }
  if (/merge_threshold|averaged|mean_vector|merged_vector/.test(fn)) {
    throw new Error("do not invent a merge formula");
  }
  if (!/compareFrameTwoAgainstFrameOne/.test(fn) && !/embedBothAndCompare/.test(fn)) {
    throw new Error("frame two must be compared against frame one");
  }
  if (!/step:\s*10/.test(fn)) {
    throw new Error("baseline is step 10");
  }
  if (!/two frames/.test(page) && !/both frames/.test(page)) {
    throw new Error("page must say two frames");
  }
  if (/vector:/.test(page)) {
    throw new Error("SN-13 must not send a stub vector");
  }
});

Deno.test("SN-13 VAI Go skips signature; VAI Pro still requires signings", async () => {
  const fn = await Deno.readTextFile(
    new URL("../enrol-baseline/index.ts", import.meta.url)
  );
  if (!/requirements_must_be_signed_before_baseline/.test(fn)) {
    throw new Error("Pro path still waits for signings");
  }
  if (!/required_credential_level/.test(fn) && !/service_level/.test(fn)) {
    throw new Error("VAI Go/VAI Access must not require VAI Pro signings");
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
  if (!/Step 13 of 13/.test(page) && !/Step 12 of 13/.test(page)) {
    throw new Error("SN-15 is step 12 then 13");
  }
});
