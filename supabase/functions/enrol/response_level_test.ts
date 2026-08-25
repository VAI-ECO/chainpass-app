import {
  internalFromBand,
  normalisePublicShape,
  shapePublicResponse,
} from "../_shared/response-level.ts";

Deno.test("one fixture per shape produces one internal result", () => {
  const computed = internalFromBand("green", 0.9123);
  const level1 = shapePublicResponse(1, computed);
  const level2 = shapePublicResponse(2, computed);
  const level3 = shapePublicResponse(3, computed);

  const a = normalisePublicShape(level1);
  const b = normalisePublicShape(level2);
  const c = normalisePublicShape(level3);

  if (a.match !== true || b.match !== true || c.match !== true) {
    throw new Error("match");
  }
  if (b.band !== "green" || c.band !== "green") throw new Error("band");
  if (c.percentage !== computed.percentage) throw new Error("percentage");
  if ("percentage" in level1) throw new Error("level 1 leaked percentage");
  if ("band" in level1) throw new Error("level 1 leaked band");
  if ("percentage" in level2) throw new Error("level 2 leaked percentage");
});

Deno.test("legacy { result } and { match, confidence } normalise here", () => {
  if (!normalisePublicShape({ result: "match" }).match) throw new Error("result");
  const conf = normalisePublicShape({ match: true, confidence: 0.91 });
  if (!conf.match) throw new Error("confidence");
});
