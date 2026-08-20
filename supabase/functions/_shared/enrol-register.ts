/**
 * §2.3 registration fields — username mandatory; contact from platform collection_fields.
 * NEVER legal name.
 */

const LEGAL_NAME_KEYS = new Set([
  "legal_name",
  "legalname",
  "full_name",
  "fullname",
  "first_name",
  "last_name",
  "given_name",
  "family_name",
  "surname",
  "middlename",
  "middle_name",
]);

export type CollectionFields = {
  /** Flat required keys, or groups: { at_least_one_of: string[] } */
  required?: string[];
  groups?: Array<{ at_least_one_of: string[] }>;
};

export type RegisterInput = {
  username?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
};

export function assertNoLegalNameFields(input: RegisterInput): void {
  for (const key of Object.keys(input)) {
    if (LEGAL_NAME_KEYS.has(key.toLowerCase())) {
      throw new Error(`legal_name_forbidden: field ${key} is not permitted (§2.3)`);
    }
    const v = input[key];
    if (typeof v === "string" && /legal\s*name/i.test(v) && key === "username") {
      // username may coincidentally contain words; do not reject content — only field names.
    }
  }
}

/**
 * Validate against platform_agreements.collection_fields.
 * Default ChainPass group when empty: username + at_least_one_of {email, phone} (§2.3 1a).
 */
export function validateRegistrationFields(
  input: RegisterInput,
  collection: CollectionFields | null | undefined
): { username: string; email: string | null; phone: string | null } {
  assertNoLegalNameFields(input);

  const username = typeof input.username === "string" ? input.username.trim() : "";
  if (!username) throw new Error("username is mandatory (§2.3)");

  const email =
    typeof input.email === "string" && input.email.trim() ? input.email.trim() : null;
  const phone =
    typeof input.phone === "string" && input.phone.trim() ? input.phone.trim() : null;

  const groups =
    collection?.groups && collection.groups.length > 0
      ? collection.groups
      : [{ at_least_one_of: ["email", "phone"] }];

  for (const g of groups) {
    const ok = g.at_least_one_of.some((field) => {
      const v = input[field];
      return typeof v === "string" && v.trim().length > 0;
    });
    if (!ok) {
      throw new Error(
        `at_least_one_of required: ${g.at_least_one_of.join("|")} (§2.3)`
      );
    }
  }

  if (collection?.required) {
    for (const key of collection.required) {
      if (LEGAL_NAME_KEYS.has(key.toLowerCase())) {
        throw new Error(`collection_fields must not require legal name: ${key}`);
      }
      if (key === "username") continue;
      const v = input[key];
      if (typeof v !== "string" || !v.trim()) {
        throw new Error(`required field missing: ${key}`);
      }
    }
  }

  return { username, email, phone };
}
