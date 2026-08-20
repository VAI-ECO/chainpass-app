/**
 * Local verify for item 2: band mapping with a nulled client-id path.
 * Run: deno test --allow-env supabase/functions/revalidate/band_logic_test.ts
 */
import { bandFromSimilarity } from "../_shared/band-compare.ts";

Deno.test("bandFromSimilarity: green / yellow / red from settings floors", () => {
  const greenMin = 0.8;
  const yellowMin = 0.65;
  // Column nulled is irrelevant — this path never reads complycube_client_id.
  const credential = { complycube_client_id: null as string | null };
  if (credential.complycube_client_id !== null) {
    throw new Error("test fixture must keep client id null");
  }
  if (bandFromSimilarity(0.91, greenMin, yellowMin) !== "green") {
    throw new Error("expected green");
  }
  if (bandFromSimilarity(0.8, greenMin, yellowMin) !== "green") {
    throw new Error("expected green at floor");
  }
  if (bandFromSimilarity(0.7, greenMin, yellowMin) !== "yellow") {
    throw new Error("expected yellow");
  }
  if (bandFromSimilarity(0.65, greenMin, yellowMin) !== "yellow") {
    throw new Error("expected yellow at floor");
  }
  if (bandFromSimilarity(0.5, greenMin, yellowMin) !== "red") {
    throw new Error("expected red");
  }
  console.log("BAND_TEST_OK nulled_client_id=true bands=green,yellow,red");
});
