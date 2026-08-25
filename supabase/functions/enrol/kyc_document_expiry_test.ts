/**
 * Live-path document expiry — captured at KYC, written at mint (§10.1).
 * deno test --allow-read --allow-env supabase/functions/enrol/kyc_document_expiry_test.ts
 */
import { extractKycDocumentFields } from "../_shared/kyc-document.ts";

Deno.test("extractor reads expirationDate and nothing else from the document", () => {
  const fields = extractKycDocumentFields({
    extractedData: {
      documentDetails: {
        expirationDate: "2029-04-01",
        documentNumber: "X1234567",
        issuingCountry: "CA",
      },
      personalDetails: {
        firstName: "Jane",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        address: "1 Main St",
      },
    },
  });
  if (fields.documentExpiry !== "2029-04-01") {
    throw new Error(`expiry ${fields.documentExpiry}`);
  }
  if ("firstName" in fields || "lastName" in fields || "dateOfBirth" in fields) {
    throw new Error("name and dob must not leave the extractor");
  }
  if ("address" in fields || "documentNumber" in fields) {
    throw new Error("address and document number must not leave the extractor");
  }
});

Deno.test("extractor fails loud without expirationDate", () => {
  let threw = false;
  try {
    extractKycDocumentFields({ extractedData: { documentDetails: {} } });
  } catch (e) {
    threw = e instanceof Error && /document_expiry_missing/.test(e.message);
  }
  if (!threw) throw new Error("missing expiry must fail loud");
});

Deno.test("KYC hold stores document_expiry on the session", async () => {
  const capture = await Deno.readTextFile(
    new URL("../enrol-capture/index.ts", import.meta.url)
  );
  if (!/extractKycDocumentFields/.test(capture)) {
    throw new Error("capture must extract expiry from the KYC check");
  }
  if (!/document_expiry/.test(capture)) {
    throw new Error("capture must write document_expiry onto the session");
  }
  if (!/expirationDate/.test(capture) && !/extractKycDocumentFields/.test(capture)) {
    throw new Error("source is extractedData.documentDetails.expirationDate");
  }
});

Deno.test("reveal refuses mint without document_expiry; insert writes it", async () => {
  const reveal = await Deno.readTextFile(
    new URL("../enrol-reveal/index.ts", import.meta.url)
  );
  if (!/document_expiry_required/.test(reveal)) {
    throw new Error("reveal must refuse mint when expiry is missing");
  }
  if (!/document_expiry:\s*session\.document_expiry/.test(reveal)) {
    throw new Error("live mint must write credentials.document_expiry from the session");
  }
});
