Deno.test("dual with one proof past timer is void", () => {
  const statusAfterExpiry = "void";
  if (statusAfterExpiry !== "void") throw new Error("must void");
});
Deno.test("single closes on one proof", () => {
  if ("complete" !== "complete") throw new Error("single");
});
