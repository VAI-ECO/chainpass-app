/**
 * §4 background check — Offenders.io adapter, binary only, no stored result.
 * Legal name leaves for the supplier only. Never written to a table.
 * deno test --allow-read --allow-net --allow-env supabase/functions/enrol/background_check_test.ts
 */
import { extractKycDocumentFields, extractKycSupplierIdentity } from "../_shared/kyc-document.ts";
import {
  callOffendersIo,
  normalizePickerResult,
  requireOffendersService,
} from "../_shared/enrol-background.ts";

const KYC_CHECK = {
  extractedData: {
    documentDetails: {
      expirationDate: "2029-04-01",
      issuingCountry: "CA",
      documentNumber: "X1234567",
    },
    personalDetails: {
      firstName: "Jane",
      lastName: "Doe",
      dateOfBirth: "1990-01-01",
      address: "1 Main St",
    },
  },
};

Deno.test("catalog seeds a background_check requirement", async () => {
  const sql = await Deno.readTextFile(
    new URL("../../migrations/20260814000001_seed_requirements.sql", import.meta.url)
  );
  if (!/\('background_check', 'Background Check', 'check', false\)/.test(sql)) {
    throw new Error("requirements.key background_check must exist");
  }
});

Deno.test("cost is a settings pointer, never a constant in the function", async () => {
  const fn = await Deno.readTextFile(
    new URL("../enrol-background/index.ts", import.meta.url)
  );
  if (!/background_check_cost/.test(fn)) {
    throw new Error("per-check cost must be settings.background_check_cost");
  }
  if (/0\.15|\$0\.15/.test(fn)) {
    throw new Error("do not hardcode the canon illustration");
  }
});

Deno.test("missing Offenders.io secrets fail loud — no silent skip", () => {
  const prevUrl = Deno.env.get("OFFENDERS_IO_URL");
  const prevKey = Deno.env.get("OFFENDERS_IO_KEY");
  Deno.env.delete("OFFENDERS_IO_URL");
  Deno.env.delete("OFFENDERS_IO_KEY");
  let threw = false;
  try {
    requireOffendersService();
  } catch (e) {
    threw = e instanceof Error && /OFFENDERS_IO_URL/.test(e.message);
  }
  if (prevUrl !== undefined) Deno.env.set("OFFENDERS_IO_URL", prevUrl);
  else Deno.env.delete("OFFENDERS_IO_URL");
  if (prevKey !== undefined) Deno.env.set("OFFENDERS_IO_KEY", prevKey);
  else Deno.env.delete("OFFENDERS_IO_KEY");
  if (!threw) throw new Error("missing supplier URL must fail loud");
});

Deno.test("persisted KYC extractor still returns no name — supplier extract is separate", () => {
  const kept = extractKycDocumentFields(KYC_CHECK);
  if ("firstName" in kept || "lastName" in kept || "dateOfBirth" in kept) {
    throw new Error("name must not sit on the persisted three fields");
  }
  const ident = extractKycSupplierIdentity(KYC_CHECK);
  if (ident.firstName !== "Jane" || ident.lastName !== "Doe") {
    throw new Error("supplier identity comes from personalDetails");
  }
  if (ident.dob !== "1990-01-01") {
    throw new Error("dob travels when the check has it");
  }
  if ("address" in ident || "documentNumber" in ident) {
    throw new Error("address and document number stay off the supplier body");
  }
  let missing = false;
  try {
    extractKycSupplierIdentity({ extractedData: { personalDetails: {} } });
  } catch (e) {
    missing = e instanceof Error && /supplier_identity_missing/.test(e.message);
  }
  if (!missing) throw new Error("no first+last — cannot claim a name-led search");
});

Deno.test("picker result is offenders.length — never their payload, never a score", () => {
  if (normalizePickerResult({ offenders: [] }) !== "clear") {
    throw new Error("empty list is clear");
  }
  if (normalizePickerResult({ offenders: [{ name: "x" }] }) !== "on_file") {
    throw new Error("any hit is on_file");
  }
  if (normalizePickerResult({ result: "clear" }) !== "unavailable") {
    throw new Error("old binary shape is not their API");
  }
  if (normalizePickerResult({ score: 0.9 }) !== "unavailable") {
    throw new Error("a score is not a result");
  }
});

Deno.test("enrol-background: name from the provider check; never written; hit is not a flag", async () => {
  const fn = await Deno.readTextFile(
    new URL("../enrol-background/index.ts", import.meta.url)
  );
  const reveal = await Deno.readTextFile(
    new URL("../enrol-reveal/index.ts", import.meta.url)
  );
  const page = await Deno.readTextFile(
    new URL("../../../src/pages/EnrolCapture.tsx", import.meta.url)
  );
  const capture = await Deno.readTextFile(
    new URL("../enrol-capture/index.ts", import.meta.url)
  );
  if (!/extractKycSupplierIdentity/.test(fn) || !/fetchLatestKycCheck/.test(fn)) {
    throw new Error("background must re-read the KYC check for the name");
  }
  if (!/provider_session_key/.test(fn)) {
    throw new Error("provider client id is how the check is fetched");
  }
  if (/firstName|lastName|dateOfBirth/.test(capture) && /update\(\{/.test(capture)) {
    // capture may mention extract keys only via shared import — must not write them
  }
  if (/issuing_country[\s\S]*firstName|first_name:|last_name:/.test(capture)) {
    throw new Error("enrol-capture must not persist a legal name");
  }
  if (!/vai_already_minted/.test(fn)) {
    throw new Error("must refuse once the V.A.I. exists");
  }
  if (/screening_state|flagged/.test(fn)) {
    throw new Error("a hit is not a flag — do not write screening_state");
  }
  if (/firstName|lastName|dob/.test(fn) && /from\("sessions"\)[\s\S]*update/.test(fn)) {
    throw new Error("do not write the name onto the session");
  }
  if (/offenders|firstName|lastName/.test(reveal) && /insert/.test(reveal)) {
    throw new Error("reveal must not persist supplier identity or payload");
  }
  if (!/status:\s*"unavailable"/.test(fn) || !/check_did_not_run/.test(fn)) {
    throw new Error("supplier down is technical; never claim a check");
  }
  if (!/requirement_completions/.test(reveal) || !/background_check/.test(reveal)) {
    throw new Error("completion row is written when the V.A.I. exists");
  }
  if (/on_file|clear/.test(reveal) && /requirement_completions/.test(reveal)) {
    throw new Error("completion row must not store the binary");
  }
  if (!/enrol-background/.test(page)) {
    throw new Error("capture must call the check before reveal");
  }
});

Deno.test("Offenders.io stub: name-led body; offenders[] maps to binary; nothing else kept", async () => {
  const seen: Record<string, unknown>[] = [];
  const ac = new AbortController();
  const server = Deno.serve(
    { hostname: "127.0.0.1", port: 0, signal: ac.signal },
    async (req) => {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      seen.push(body);
      if (body.lastName === "Down") {
        return new Response("no", { status: 503 });
      }
      const offenders = body.lastName === "Hit" ? [{ name: "must-not-persist" }] : [];
      return new Response(JSON.stringify({ offenders }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  );
  try {
    const addr = server.addr;
    if (!("port" in addr)) throw new Error("no port");
    const face = { url: `http://127.0.0.1:${addr.port}/`, key: "k" };
    const clear = await callOffendersIo(face, {
      firstName: "Jane",
      lastName: "Clear",
      dob: "1990-01-01",
    });
    const hit = await callOffendersIo(face, {
      firstName: "Jane",
      lastName: "Hit",
    });
    const down = await callOffendersIo(face, {
      firstName: "Jane",
      lastName: "Down",
    });
    if (clear !== "clear" || hit !== "on_file" || down !== "unavailable") {
      throw new Error(`got ${clear} ${hit} ${down}`);
    }
    if (seen[0]?.firstName !== "Jane" || seen[0]?.lastName !== "Clear") {
      throw new Error("body must be firstName + lastName");
    }
    if (seen[0]?.dob !== "1990-01-01") {
      throw new Error("dob travels when present");
    }
    if ("contact_email" in seen[0] || "session_id" in seen[0] || "username" in seen[0]) {
      throw new Error("session contact is not their index");
    }
  } finally {
    ac.abort();
    await server.shutdown();
  }
});
