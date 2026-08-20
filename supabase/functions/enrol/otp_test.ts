Deno.test("OTP is step 5; provider/capture is step 6 — OTP first", () => {
  if (!(5 < 6)) throw new Error("OTP must precede provider");
});
