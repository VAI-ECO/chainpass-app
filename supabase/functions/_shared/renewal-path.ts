/**
 * Renewal path from the two-date test (§10.1 / §16.4).
 * document_expiry = canon document_expires_at (live name).
 * next_complycube_date = provider retention (§10.3).
 */
function dateStillLive(value: string | null | undefined, now: Date): boolean {
  if (!value) return false;
  const d = new Date(value);
  if (isNaN(d.getTime())) return false;
  const end = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return end >= today;
}

export function renewalPath(
  documentExpiry: string | null | undefined,
  providerRetention: string | null | undefined,
  now: Date = new Date()
): "in_house" | "full_verification_required" {
  const docLive = dateStillLive(documentExpiry, now);
  const retentionLive = dateStillLive(providerRetention, now);
  if (docLive && retentionLive) return "in_house";
  return "full_verification_required";
}
