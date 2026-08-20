/**
 * Item 5: band only — never percentage / similarity in public body.
 * deno test --allow-env supabase/functions/gate/band_response_test.ts
 */
import { assertNoPercentageInBody, publicGateBody } from "../_shared/gate-response.ts";

Deno.test("publicGateBody strips similarity and rejects percent", () => {
  const safe = publicGateBody({
    status: "granted",
    band: "green",
    similarity: 0.97,
    percentage: "97%",
  });
  if ("similarity" in safe) throw new Error("similarity leaked");
  if ("percentage" in safe) throw new Error("percentage leaked");
  if (JSON.stringify(safe).includes("%")) throw new Error("% in body");
  if (safe.band !== "green") throw new Error("band lost");
});

Deno.test("assertNoPercentageInBody throws on %", () => {
  let threw = false;
  try {
    assertNoPercentageInBody({ status: "granted", note: "97%" });
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("expected throw");
});

Deno.test("numeric band rejected", () => {
  let threw = false;
  try {
    assertNoPercentageInBody({ status: "granted", band: 0.97 as unknown as string });
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("expected throw on numeric band");
});
