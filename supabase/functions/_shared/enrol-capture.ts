/**
 * §2.7 — simultaneous capture hold / void / commit helpers.
 */

export function requireComplyCubeApiKey(): string {
  const key = Deno.env.get("COMPLYCUBE_API_KEY");
  if (!key) {
    throw new Error(
      "COMPLYCUBE_API_KEY environment variable is not configured. Cannot proceed."
    );
  }
  return key;
}

export function assertEmbeddedProviderSession(body: Record<string, unknown>): void {
  if (body.redirectUrl !== undefined || body.successUrl !== undefined) {
    throw new Error("provider_must_be_embedded_not_redirect");
  }
  const legal = ["firstName", "lastName", "legal_name", "full_name", "first_name", "last_name"];
  for (const k of legal) {
    if (body[k] !== undefined) {
      throw new Error(`legal_name_forbidden: field ${k} is not permitted (§2.3)`);
    }
  }
}

export function voidHeldCaptureOnBreak(session: {
  held_capture: string | null;
  held_capture_voided_at: string | null;
}): { held_capture: null; held_capture_voided_at: string } {
  return {
    held_capture: null,
    held_capture_voided_at: new Date().toISOString(),
  };
}

/** Break voids capture only — enrolment session and registration remain. */
export function breakVoidsCaptureNotEnrolment(args: {
  username: string | null;
  held_capture: string | null;
  after_void_held: string | null;
}): boolean {
  return (
    !!args.username &&
    args.held_capture != null &&
    args.after_void_held == null
  );
}
