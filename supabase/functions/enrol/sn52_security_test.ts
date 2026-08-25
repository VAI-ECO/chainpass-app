/**
 * SN-52 account security at ChainPass step 12.
 * deno test --allow-read --allow-env supabase/functions/enrol/sn52_security_test.ts
 */
async function read(rel: string): Promise<string> {
  return await Deno.readTextFile(new URL(rel, import.meta.url));
}

Deno.test("recovery migration has cleared_by chainpass_reverification and vai FKs", async () => {
  const sql = await read("../../migrations/20260822100000_recovery_tables_chainpass.sql");
  if (!/cleared_by = 'chainpass_reverification'/.test(sql)) {
    throw new Error("cleared_by check required");
  }
  if (!/REFERENCES public.credentials\(vai\)/.test(sql)) {
    throw new Error("recovery tables must FK to credentials.vai");
  }
  for (const t of [
    "security_questions",
    "security_question_lockouts",
    "security_question_attempts",
    "security_question_options",
    "recovery_codes",
  ]) {
    if (!sql.includes(t)) throw new Error(`missing ${t}`);
  }
});

Deno.test("enrol-security hashes answers and codes; counts from settings", async () => {
  const fn = await read("../enrol-security/index.ts");
  if (!/slot_number/.test(fn) || !/answer_hash/.test(fn)) {
    throw new Error("hashed question slots");
  }
  if (!/security_question_count/.test(fn) || !/recovery_code_count/.test(fn)) {
    throw new Error("counts from settings keys");
  }
  if (/\bquestions\.length !== 3\b|\bfor \(let i = 0; i < 3;/.test(fn)) {
    throw new Error("no hardcoded three");
  }
  if (!/code_hash/.test(fn) || !/recovery_codes/.test(fn)) {
    throw new Error("recovery codes stored hashed");
  }
  if (/return json\([^)]*answer_hash/.test(fn)) {
    throw new Error("hashes must not be returned");
  }
  const page = await read("../../../src/pages/EnrolSecurity.tsx");
  if (!/enrol-security/.test(page)) throw new Error("SN-52 writes through enrol-security");
  if (!/settings:security_question_count/.test(page)) {
    throw new Error("UI points at security_question_count");
  }
  if (!/settings:recovery_code_count/.test(page)) {
    throw new Error("UI points at recovery_code_count");
  }
  if (!/I have written them down/.test(page) && !/written/.test(page)) {
    throw new Error("codes must be acknowledged once");
  }
  if (/Your three one-time|Three questions\./.test(page)) {
    throw new Error("no 'three' in member copy");
  }
});

Deno.test("handoff refuses without security rows", async () => {
  const handoff = await read("../enrol-handoff/index.ts");
  if (!/security_required_before_handoff/.test(handoff)) {
    throw new Error("handoff must 403 without security");
  }
});
