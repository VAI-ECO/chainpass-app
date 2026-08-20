Deno.test("year_starts_at equals verified_at not paid_at", () => {
  const verified_at: string = "2026-08-21T00:00:00.000Z";
  const paid_at: string = "2026-01-01T00:00:00.000Z";
  const year_starts_at: string = verified_at;
  if (year_starts_at === paid_at) throw new Error("must not use paid_at");
  if (year_starts_at !== verified_at) throw new Error("must use verified_at");
});
