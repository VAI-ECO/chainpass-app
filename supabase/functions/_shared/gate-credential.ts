import { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type CredentialGateRow = {
  vai: string;
  state: string;
  credential_level: number | null;
};

/**
 * §16.3 — credential: exists · active · credential_level ≥ required_level.
 * Returns null when no credential (caller issues enroll_required).
 */
export async function loadCredentialForGate(
  supabase: SupabaseClient,
  vai: string
): Promise<CredentialGateRow | null> {
  const { data, error } = await supabase
    .from("credentials")
    .select("vai, state, credential_level")
    .eq("vai", vai)
    .maybeSingle();

  if (error) {
    throw new Error(`credential lookup failed: ${error.message}`);
  }
  return data as CredentialGateRow | null;
}

/** Active for gate purposes: state is active or expiring (still usable). */
export function credentialIsActive(state: string): boolean {
  return state === "active" || state === "expiring";
}

/**
 * ONE INTEGER COMPARISON on credential level vs endpoint required level.
 * Missing credential_level fails closed.
 */
export function credentialMeetsRequiredLevel(
  credentialLevel: number | null,
  requiredLevel: number
): boolean {
  if (credentialLevel == null || !Number.isInteger(credentialLevel)) return false;
  if (!Number.isInteger(requiredLevel)) return false;
  return credentialLevel >= requiredLevel;
}
