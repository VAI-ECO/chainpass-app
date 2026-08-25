/**
 * CANON-CP-02 §1 step 9 — contact from the platform row, ChainPass floor underneath.
 * Floor: one of phone or email, plus terms. Username only when the platform requires it.
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
  /** Keys the platform requires on top of the ChainPass floor. */
  required?: string[];
  groups?: Array<{ at_least_one_of: string[] }>;
};

export type RegisterInput = {
  username?: string;
  email?: string;
  phone?: string;
  terms_accepted?: boolean;
  [key: string]: unknown;
};

export function assertNoLegalNameFields(input: RegisterInput): void {
  for (const key of Object.keys(input)) {
    if (LEGAL_NAME_KEYS.has(key.toLowerCase())) {
      throw new Error(`legal_name_forbidden: field ${key} is not permitted (§2.3)`);
    }
  }
}

/**
 * What step 9 collects for a platform row's contact_spec.
 * Floor always: email or phone, plus terms. Platform required keys add on top.
 */
export function step9Collects(
  collection: CollectionFields | null | undefined
): string[] {
  const required = collection?.required ?? [];
  const fields: string[] = [];
  if (required.includes("username")) fields.push("username");
  const emailReq = required.includes("email");
  const phoneReq = required.includes("phone");
  if (emailReq) fields.push("email");
  if (phoneReq) fields.push("phone");
  if (!emailReq && !phoneReq) fields.push("email or phone");
  fields.push("terms and conditions");
  return fields;
}

function filled(input: RegisterInput, key: string): boolean {
  const v = input[key];
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Validate against platforms.contact_spec.
 * Floor is never skipped. Platform required keys are never hardcoded.
 */
export function validateRegistrationFields(
  input: RegisterInput,
  collection: CollectionFields | null | undefined
): { username: string | null; email: string | null; phone: string | null } {
  assertNoLegalNameFields(input);

  if (input.terms_accepted !== true) {
    throw new Error("terms_and_conditions_required");
  }

  const usernameRaw = typeof input.username === "string" ? input.username.trim() : "";
  const username = usernameRaw ? usernameRaw : null;
  const email =
    typeof input.email === "string" && input.email.trim() ? input.email.trim() : null;
  const phone =
    typeof input.phone === "string" && input.phone.trim() ? input.phone.trim() : null;

  if (!email && !phone) {
    throw new Error("at_least_one_of required: email|phone (ChainPass floor)");
  }

  const required = collection?.required ?? [];
  for (const key of required) {
    if (LEGAL_NAME_KEYS.has(key.toLowerCase())) {
      throw new Error(`collection_fields must not require legal name: ${key}`);
    }
    if (key === "username") {
      if (!username) throw new Error("required field missing: username");
      continue;
    }
    if (!filled(input, key)) {
      throw new Error(`required field missing: ${key}`);
    }
  }

  return { username, email, phone };
}
