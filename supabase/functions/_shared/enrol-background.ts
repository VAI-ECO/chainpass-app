/**
 * §4 picker adapter. Binary only. Outside our walls.
 * Legal name is for this supplier call only — never persisted.
 * Never persist the supplier payload, a score, or a flag.
 */

import type { KycSupplierIdentity } from "./kyc-document.ts";

export type PickerBinary = "clear" | "on_file";
export type PickerOutcome = PickerBinary | "unavailable";

export function requireOffendersService(): { url: string; key: string } {
  const url = Deno.env.get("OFFENDERS_IO_URL");
  const key = Deno.env.get("OFFENDERS_IO_KEY");
  if (!url) {
    throw new Error(
      "OFFENDERS_IO_URL environment variable is not configured. Cannot proceed."
    );
  }
  if (!key) {
    throw new Error(
      "OFFENDERS_IO_KEY environment variable is not configured. Cannot proceed."
    );
  }
  return { url, key };
}

export function normalizePickerResult(body: unknown): PickerOutcome {
  if (!body || typeof body !== "object") return "unavailable";
  const offenders = (body as { offenders?: unknown }).offenders;
  if (!Array.isArray(offenders)) return "unavailable";
  return offenders.length > 0 ? "on_file" : "clear";
}

export async function callOffendersIo(
  face: { url: string; key: string },
  identity: KycSupplierIdentity
): Promise<PickerOutcome> {
  const body: Record<string, string> = {
    firstName: identity.firstName,
    lastName: identity.lastName,
  };
  if (identity.dob) body.dob = identity.dob;
  try {
    const response = await fetch(face.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${face.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) return "unavailable";
    const payload = await response.json().catch(() => null);
    const outcome = normalizePickerResult(payload);
    return outcome;
  } catch {
    return "unavailable";
  }
}
