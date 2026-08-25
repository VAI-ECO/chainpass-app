/**
 * Local verify: band mapping. Patent gate — revalidate must not read complycube_client_id.
 * Run: deno test --allow-read --allow-env supabase/functions/revalidate/band_logic_test.ts
 */
import { bandFromSimilarity } from "../_shared/band-compare.ts";

Deno.test("bandFromSimilarity: green / yellow / red from settings floors", () => {
  const greenMin = 0.8;
  const yellowMin = 0.65;
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
});

Deno.test("revalidate source does not select complycube_client_id", async () => {
  const src = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
  if (/complycube_client_id/.test(src)) {
    throw new Error("patent gate: revalidate must not read complycube_client_id");
  }
});
