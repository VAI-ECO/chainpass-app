/** VAI Go / VAI Access = levels 1–2. VAI Pro = 3. */

export function nextAfterAcceptance(level: number | null | undefined): "baseline" | "requirements" {
  return level === 3 ? "requirements" : "baseline";
}

export function voidAcceptanceCaptureOnBreak(): {
  acceptance_capture: null;
  acceptance_capture_voided_at: string;
} {
  return {
    acceptance_capture: null,
    acceptance_capture_voided_at: new Date().toISOString(),
  };
}

export function assertTermsChecked(body: Record<string, unknown>): void {
  if (body.terms_checked !== true) {
    throw new Error("terms_checkbox_required");
  }
}

export function stripPercentFromPublic(body: Record<string, unknown>): Record<string, unknown> {
  const out = { ...body };
  delete out.kyc_match_percent;
  delete out.kyc_percent;
  delete out.match_percent;
  return out;
}
