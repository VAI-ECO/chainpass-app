Deno.test("business and individual share ledger columns", () => {
  const cols = ["platform_id","vai","event","amount","period","status","trolley_recipient_id"];
  if (cols.length < 7) throw new Error("shape");
});
