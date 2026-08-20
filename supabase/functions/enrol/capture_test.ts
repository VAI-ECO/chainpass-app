import { breakVoidsCaptureNotEnrolment, voidHeldCaptureOnBreak } from "../_shared/enrol-capture.ts";
Deno.test("§2.7 5a break voids capture not enrolment", () => {
  const before = { held_capture: "frame", held_capture_voided_at: null as string | null };
  const after = voidHeldCaptureOnBreak(before);
  if (after.held_capture !== null) throw new Error("capture not voided");
  if (!breakVoidsCaptureNotEnrolment({
    username: "neo",
    held_capture: "frame",
    after_void_held: after.held_capture,
  })) throw new Error("enrolment should remain");
});
