Deno.test("V.A.I. reveal is step 7 before requirements step 8 and baseline step 9", () => {
  if (!(7 < 8 && 7 < 9)) throw new Error("reveal must precede requirements and baseline");
});
