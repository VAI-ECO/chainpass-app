import { normaliseMatchOutput, publicMatchShape } from "../_shared/bank-adapter.ts";
Deno.test("normalises confidence shape to band", () => {
  const i = normaliseMatchOutput({ match: true, confidence: 0.9 });
  if (i.band !== "green") throw new Error("green");
  if (publicMatchShape(i).band !== "green") throw new Error("public");
});
Deno.test("normalises result shape to band", () => {
  if (normaliseMatchOutput({ result: "no_match" }).band !== "red") throw new Error("red");
});
