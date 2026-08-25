/** Payment gates every enrolment step after landing. Server-side only. */

export const PAY_REQUIRED = "pay_required";

export function refuseUnpaid(session: { paid_at?: string | null } | null): {
  error: string;
} | null {
  if (!session) return null;
  if (session.paid_at) return null;
  return { error: PAY_REQUIRED };
}
