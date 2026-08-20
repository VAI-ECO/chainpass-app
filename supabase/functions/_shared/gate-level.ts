/**
 * §14.1 — Endpoints check agreement level ≥ endpoint required level AND NOTHING ELSE.
 * One integer comparison.
 */
export function agreementMeetsEndpointLevel(
  agreementLevel: number,
  endpointRequiredLevel: number
): boolean {
  if (!Number.isInteger(agreementLevel) || !Number.isInteger(endpointRequiredLevel)) {
    throw new Error("service levels must be integers");
  }
  if (agreementLevel < 1 || agreementLevel > 3 || endpointRequiredLevel < 1 || endpointRequiredLevel > 3) {
    throw new Error("service levels must be in 1..3");
  }
  return agreementLevel >= endpointRequiredLevel;
}
