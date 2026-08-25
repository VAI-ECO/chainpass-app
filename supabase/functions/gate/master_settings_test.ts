/**
 * SN-44 master-settings function — list/set shape; audit table name.
 * deno test --allow-read supabase/functions/gate/master_settings_test.ts
 */
async function read(rel: string): Promise<string> {
  return await Deno.readTextFile(new URL(rel, import.meta.url));
}

Deno.test("master-settings refuses unknown keys and writes settings_audit on set", async () => {
  const fn = await read("../master-settings/index.ts");
  if (!/unknown_key/.test(fn)) throw new Error("unknown keys rejected");
  if (!/settings_audit/.test(fn)) throw new Error("audit insert");
  if (!/old_value/.test(fn) || !/new_value/.test(fn)) {
    throw new Error("before and after on audit");
  }
  if (/\b0\.80\b|\b29\b|\b99\b/.test(fn)) {
    throw new Error("no product figures in the function");
  }
});

Deno.test("migration seeds named keys UNSET and creates settings_audit", async () => {
  const mig = await Deno.readTextFile(
    new URL(
      "../../migrations/20260824100000_settings_audit_and_named_keys.sql",
      import.meta.url
    )
  );
  if (!/CREATE TABLE IF NOT EXISTS public\.settings_audit/.test(mig)) {
    throw new Error("settings_audit table");
  }
  if (!/'renewal_window', 'UNSET'/.test(mig)) throw new Error("renewal_window UNSET");
  if (!/'security_question_count', 'UNSET'/.test(mig)) {
    throw new Error("security_question_count UNSET");
  }
  if (!/'reds_threshold', 'UNSET'/.test(mig)) throw new Error("reds_threshold UNSET");
  const otpMig = await Deno.readTextFile(
    new URL(
      "../../migrations/20260824120000_reds_count_and_otp_attempts.sql",
      import.meta.url
    )
  );
  if (!/'recovery_otp_max_attempts', 'UNSET'/.test(otpMig)) {
    throw new Error("recovery_otp_max_attempts UNSET");
  }
  // Never invent a market figure in this migration.
  if (/'[0-9]+\.?[0-9]*'/.test(mig) && !/'UNSET'/.test(mig)) {
    // allow only UNSET string seeds in the INSERT block
  }
  const insertBlock = mig.slice(mig.indexOf("INSERT INTO public.settings"));
  if (/'[0-9]/.test(insertBlock)) {
    throw new Error("named-key seed must be UNSET, not a figure");
  }
});
