/**
 * Determines which renewal frame (A or B) is required for a credential
 *
 * Frame A: ComplyCube required (new document needed)
 * Frame B: Face check only (document still valid)
 *
 * THE DECISION: today > next_complycube_date
 */
export function determineRenewalFrame(nextComplyCubeDate: string): "A" | "B" {
  const today = new Date();
  const complycubeDate = new Date(nextComplyCubeDate);

  return today > complycubeDate ? "A" : "B";
}
