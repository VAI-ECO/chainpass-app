/**
 * Settlement / ledger path must never carry name or email fields.
 * deno test --allow-read --allow-env supabase/functions/commission/settlement_test.ts
 */
Deno.test("ledger + settlement path: zero name/email fields", async () => {
  const files = [
    new URL("../_shared/commission.ts", import.meta.url),
    new URL("../_shared/settlement.ts", import.meta.url),
    new URL("../settlement/index.ts", import.meta.url),
    new URL("../commission/index.ts", import.meta.url),
  ];
  // Field identifiers only — not prose about forbidding them
  const banned =
    /\b(legal_name|full_name|first_name|last_name|email|bank_account|tax_id|ssn|payee_name|recipient_email)\b/;
  for (const u of files) {
    const text = await Deno.readTextFile(u);
    if (banned.test(text)) {
      throw new Error(`identity field in ${u.pathname}`);
    }
  }
});

Deno.test("status machine refuses empty trolley_payout_ref", async () => {
  const { settlePayable } = await import("../_shared/settlement.ts");
  let threw = false;
  try {
    await settlePayable({} as never, { trolley_payout_ref: "" });
  } catch (e) {
    threw = /trolley_payout_ref/.test(String(e));
  }
  if (!threw) throw new Error("empty payout ref must fail");
});

Deno.test("payee column is trolley_recipient_id only", async () => {
  const text = await Deno.readTextFile(
    new URL("../_shared/commission.ts", import.meta.url)
  );
  if (!/trolley_recipient_id/.test(text)) throw new Error("missing payee col");
  if (/payee_name|recipient_email|recipient_name/.test(text)) {
    throw new Error("must not store PII payee columns");
  }
});
