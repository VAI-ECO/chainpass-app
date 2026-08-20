import { COMMISSION_LEDGER_FORBIDDEN_FIELDS } from "../_shared/commission.ts";
Deno.test("payee fields exclude name email bank tax", () => {
  for (const f of COMMISSION_LEDGER_FORBIDDEN_FIELDS) {
    if (!["name","email","bank","tax","legal_name"].includes(f)) throw new Error(f);
  }
});
