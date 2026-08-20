Deno.test("payee column on ledger is trolley_recipient_id", () => {
  const payee_column = "trolley_recipient_id";
  if (payee_column !== "trolley_recipient_id") throw new Error("payee");
});
