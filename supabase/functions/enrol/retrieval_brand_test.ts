import { retrievalHeading } from "../../../src/lib/retrieval-brand.ts";

Deno.test("one template, two platform brands", () => {
  const platformRows = [
    { id: "vairify", brand: "VAIRIFY" },
    { id: "other", brand: "AVCHEXX" },
  ];
  const rendered = platformRows.map((row) => retrievalHeading(row.brand));
  if (rendered[0] === rendered[1]) throw new Error("brands must differ");
  if (rendered[0] !== "VAIRIFY recovery") throw new Error(String(rendered[0]));
  if (rendered[1] !== "AVCHEXX recovery") throw new Error(String(rendered[1]));
});
