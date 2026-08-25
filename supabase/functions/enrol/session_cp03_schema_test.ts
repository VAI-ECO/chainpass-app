/**
 * Phase 2 — session columns exist in the unapplied migration text.
 * deno test --allow-read supabase/functions/enrol/session_cp03_schema_test.ts
 */
Deno.test("migration raises enrolment_step to 13 and adds frame-two columns", async () => {
  const sql = await Deno.readTextFile(
    new URL(
      "../../migrations/20260822110000_enrol_two_frames_thirteen_steps.sql",
      import.meta.url
    )
  );
  if (!/enrolment_step <= 13/.test(sql)) {
    throw new Error("CHECK must allow enrolment_step <= 13");
  }
  for (const col of [
    "kyc_match_percent",
    "acceptance_capture",
    "acceptance_capture_voided_at",
    "terms_accepted_at",
  ]) {
    if (!sql.includes(col)) throw new Error(`missing column ${col}`);
  }
  if (!/GRANT SELECT, INSERT, UPDATE ON public.sessions TO service_role/.test(sql)) {
    throw new Error("service_role DML grant required");
  }
  if (/Held until step 9/.test(sql)) {
    throw new Error("held_capture comment must not say held until step 9");
  }
});
