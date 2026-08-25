/**
 * Fields ChainPass may keep from a KYC check:
 * document expiry (§10.1), issuing country, issuing province when present.
 * Source: extractedData.documentDetails.
 * Never name, dob, address, or document number.
 */

export type KycDocumentFields = {
  documentExpiry: string;
  issuingCountry: string | null;
  issuingProvince: string | null;
};

type DocumentDetails = {
  expirationDate?: unknown;
  issuingCountry?: unknown;
  issuingCountryCode?: unknown;
  country?: unknown;
  issuingState?: unknown;
  issuingProvince?: unknown;
  state?: unknown;
  province?: unknown;
};

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function extractKycDocumentFields(check: unknown): KycDocumentFields {
  const extracted =
    check && typeof check === "object"
      ? (check as { extractedData?: { documentDetails?: DocumentDetails } })
          .extractedData
      : undefined;
  const details = extracted?.documentDetails ?? {};
  const expiry =
    typeof details.expirationDate === "string"
      ? details.expirationDate.trim()
      : "";
  if (!expiry) {
    throw new Error("document_expiry_missing");
  }
  return {
    documentExpiry: expiry,
    issuingCountry: firstString(
      details.issuingCountry,
      details.issuingCountryCode,
      details.country
    ),
    issuingProvince: firstString(
      details.issuingState,
      details.issuingProvince,
      details.state,
      details.province
    ),
  };
}

export type KycSupplierIdentity = {
  firstName: string;
  lastName: string;
  dob?: string;
};

/**
 * Name for the Offenders.io call only. Not persisted.
 * Source: extractedData.personalDetails. firstName + lastName required; dob optional.
 */
export function extractKycSupplierIdentity(check: unknown): KycSupplierIdentity {
  const extracted =
    check && typeof check === "object"
      ? (check as {
          extractedData?: {
            personalDetails?: {
              firstName?: unknown;
              lastName?: unknown;
              dateOfBirth?: unknown;
              dob?: unknown;
            };
          };
        }).extractedData
      : undefined;
  const person = extracted?.personalDetails ?? {};
  const firstName = firstString(person.firstName);
  const lastName = firstString(person.lastName);
  if (!firstName || !lastName) {
    throw new Error("supplier_identity_missing");
  }
  const dob = firstString(person.dateOfBirth, person.dob);
  return dob ? { firstName, lastName, dob } : { firstName, lastName };
}

export async function fetchLatestKycCheck(
  clientId: string,
  apiKey: string
): Promise<unknown> {
  const response = await fetch(
    `https://api.complycube.com/v1/clients/${clientId}/checks`,
    { headers: { Authorization: apiKey } }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ComplyCube checks fetch failed: ${response.status} - ${errorText}`
    );
  }
  const checksData = await response.json();
  const latestCheck = checksData.items?.[0];
  if (!latestCheck) {
    throw new Error("document_expiry_missing");
  }
  return latestCheck;
}
