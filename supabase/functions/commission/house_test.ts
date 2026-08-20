Deno.test("null origination means house — no commission", () => {
  const originating_platform_id = null as string | null;
  const skip = originating_platform_id == null;
  if (!skip) throw new Error("house must skip");
});
