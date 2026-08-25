/**
 * Band always. Numeric percentage may leave at response level 3.
 * deno test --allow-env supabase/functions/gate/band_response_test.ts
 */
import { assertNoPercentageInBody, publicGateBody } from "../_shared/gate-response.ts";

Deno.test("publicGateBody strips similarity and string percent; keeps numeric percentage", () => {
  const safe = publicGateBody({
    status: "granted",
    band: "green",
    similarity: 0.97,
    percentage: 97,
  });
  if ("similarity" in safe) throw new Error("similarity leaked");
  if (safe.percentage !== 97) throw new Error("numeric percentage dropped");
  if (JSON.stringify(safe).includes("%")) throw new Error("% in body");
  if (safe.band !== "green") throw new Error("band lost");
});

Deno.test("trial_approved is a status with no band", () => {
  const safe = publicGateBody({ status: "trial_approved" });
  if (safe.status !== "trial_approved") throw new Error("status lost");
  if ("band" in safe) throw new Error("trial must not carry a band");
  if ("percentage" in safe) throw new Error("trial must not carry a percentage");
});

Deno.test("trial is one state at every response level", async () => {
  const { trialApprovedBody } = await import("../_shared/response-level.ts");
  const a = trialApprovedBody(1);
  const b = trialApprovedBody(2);
  const c = trialApprovedBody(3);
  const dump = JSON.stringify(a);
  if (dump !== JSON.stringify(b) || dump !== JSON.stringify(c)) {
    throw new Error(`bodies differ: ${JSON.stringify(a)} ${JSON.stringify(b)} ${JSON.stringify(c)}`);
  }
  if (a.status !== "trial_approved") throw new Error("status");
  if ("band" in a || "match" in a || "percentage" in a) {
    throw new Error("trial must not look like a real response");
  }
  console.log("level 1", JSON.stringify(a));
  console.log("level 2", JSON.stringify(b));
  console.log("level 3", JSON.stringify(c));
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
