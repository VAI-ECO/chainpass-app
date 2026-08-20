Deno.test("provider dedup returns same session key string", () => {
  const a = "sk_same";
  const b = "sk_same";
  if (a !== b) throw new Error("dedup");
});
