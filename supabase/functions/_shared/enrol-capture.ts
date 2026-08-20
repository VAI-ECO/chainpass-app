/**
 * §2.7 — simultaneous capture hold / void / commit helpers.
 */

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
