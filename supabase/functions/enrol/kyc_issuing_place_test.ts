/**
 * Issuing country (and province when the document carries it) at mint.
 * deno test --allow-read --allow-env supabase/functions/enrol/kyc_issuing_place_test.ts
 */
import { extractKycDocumentFields } from "../_shared/kyc-document.ts";

Deno.test("extractor keeps issuing country; province when present; null when not", () => {
  const licence = extractKycDocumentFields({
    extractedData: {
      documentDetails: {
        expirationDate: "2028-06-01",
        issuingCountry: "CA",
        issuingState: "ON",
        documentNumber: "D1234567",
      },
      personalDetails: {
        firstName: "Alex",
        lastName: "River",
        dateOfBirth: "1988-03-02",
        address: "9 King St",
      },
    },
  });
  if (licence.issuingCountry !== "CA") {
    throw new Error(`country ${licence.issuingCountry}`);
  }
  if (licence.issuingProvince !== "ON") {
    throw new Error(`province ${licence.issuingProvince}`);
  }
  const passport = extractKycDocumentFields({
    extractedData: {
      documentDetails: {
        expirationDate: "2030-01-01",
        issuingCountry: "GB",
      },
    },
  });
  if (passport.issuingCountry !== "GB") {
    throw new Error("passport country");
  }
  if (passport.issuingProvince !== null) {
    throw new Error("passport province must be null");
  }
  const keys = Object.keys(licence).sort();
  if (keys.join(",") !== "documentExpiry,issuingCountry,issuingProvince") {
    throw new Error(`only three fields leave the extractor, got ${keys.join(",")}`);
  }
});

Deno.test("session and credential columns exist; mint writes country", async () => {
  const sql = await Deno.readTextFile(
    new URL(
      "../../migrations/20260823130000_kyc_issuing_place.sql",
      import.meta.url
    )
  );
  if (!/issuing_country/.test(sql) || !/issuing_province/.test(sql)) {
    throw new Error("add issuing_country and issuing_province");
  }
  const capture = await Deno.readTextFile(
    new URL("../enrol-capture/index.ts", import.meta.url)
  );
  const reveal = await Deno.readTextFile(
    new URL("../enrol-reveal/index.ts", import.meta.url)
  );
  if (!/issuing_country/.test(capture) || !/issuing_province/.test(capture)) {
    throw new Error("KYC hold must persist country and province on the session");
  }
  if (!/issuing_country_required/.test(reveal)) {
    throw new Error("reveal must refuse mint without issuing country");
  }
  if (!/issuing_country:\s*session\.issuing_country/.test(reveal)) {
    throw new Error("mint must write credentials.issuing_country");
  }
  if (!/issuing_province:\s*session\.issuing_province/.test(reveal)) {
    throw new Error("mint must write credentials.issuing_province");
  }
  if (/firstName|lastName|dateOfBirth|documentNumber/.test(reveal)) {
    throw new Error("reveal must not store name, dob, or document number");
  }
  if (/firstName|lastName|dateOfBirth|documentNumber/.test(capture)) {
    throw new Error("capture must not store name, dob, or document number");
  }
});
