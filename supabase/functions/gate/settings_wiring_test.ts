/**
 * Reds threshold · renewal window · recovery OTP · handoff counts · blocks alert.
 * deno test --allow-read supabase/functions/gate/settings_wiring_test.ts
 */
async function read(rel: string): Promise<string> {
  return await Deno.readTextFile(new URL(rel, import.meta.url));
}

Deno.test("enrol-handoff reads security_question_count and recovery_code_count", async () => {
  const fn = await read("../enrol-handoff/index.ts");
  if (!/getSettingNumber\(supabase,\s*"security_question_count"\)/.test(fn)) {
    throw new Error("handoff must read security_question_count");
  }
  if (!/getSettingNumber\(supabase,\s*"recovery_code_count"\)/.test(fn)) {
    throw new Error("handoff must read recovery_code_count");
  }
  if (/\(qCount ?? 0\) < 3/.test(fn) || /\(cCount ?? 0\) < 3/.test(fn)) {
    throw new Error("handoff must not hardcode < 3");
  }
});

Deno.test("check-renewals reads renewal_window and credential_year_length_years", async () => {
  const fn = await read("../check-renewals/index.ts");
  if (!/getSettingNumber\(supabase,\s*"renewal_window"\)/.test(fn)) {
    throw new Error("renewal_window required");
  }
  if (!/getSettingNumber\(supabase,\s*"credential_year_length_years"\)/.test(fn)) {
    throw new Error("term years from settings");
  }
  if (/daysUntilRenewal <= 30/.test(fn)) {
    throw new Error("must not hardcode 30-day window");
  }
  if (/setFullYear\([^)]*-\s*1\)/.test(fn)) {
    throw new Error("must not hardcode -1 year");
  }
});

Deno.test("verify-recovery-otp reads recovery_otp_max_attempts", async () => {
  const fn = await read("../verify-recovery-otp/index.ts");
  if (!/getSettingNumber\(supabase,\s*"recovery_otp_max_attempts"\)/.test(fn)) {
    throw new Error("OTP max from settings");
  }
  if (/MAX_ATTEMPTS\s*=\s*5/.test(fn)) {
    throw new Error("no hardcoded MAX_ATTEMPTS = 5");
  }
});

Deno.test("blocks status compares remaining to blocks_alert_threshold", async () => {
  const fn = await read("../blocks/index.ts");
  if (!/getSettingNumber\(supabase,\s*"blocks_alert_threshold"\)/.test(fn)) {
    throw new Error("alert threshold from settings");
  }
  if (!/alert_low/.test(fn)) throw new Error("alert_low in response");
  if (!/purchase/.test(fn)) throw new Error("purchase path");
});

Deno.test("reds-threshold helper and gate face path use settings:reds_threshold", async () => {
  const helper = await read("../_shared/reds-threshold.ts");
  const visits = await read("../_shared/gate-visits.ts");
  const facial = await read("../verify-vai-facial/index.ts");
  if (!/getSettingNumber\(supabase,\s*"reds_threshold"\)/.test(helper)) {
    throw new Error("helper reads reds_threshold");
  }
  if (!/rebaseline_required/.test(helper)) throw new Error("fourth state name");
  if (!/recordRedAndResolve/.test(visits)) throw new Error("gate visits wired");
  if (!/recordRedAndResolve/.test(facial)) throw new Error("verify-vai-facial wired");
  if (/Deno\.env\.get\(\s*["']FACE_MATCH_THRESHOLD["']\s*\)/.test(facial)) {
    throw new Error("FACE_MATCH_THRESHOLD env must not drive the product dial");
  }
});

Deno.test("FacialVerification tips are not a hardcoded attempt index", async () => {
  const page = await read("../../../src/pages/FacialVerification.tsx");
  if (/attempts\s*>=\s*3/.test(page)) {
    throw new Error("tips must not use attempts >= 3");
  }
  if (!/attempt_count_n/.test(page)) {
    throw new Error("page must still load attempt_count_n");
  }
});

Deno.test("enrol session and facial windows read settings; no hardcoded hours", async () => {
  const enrol = await read("../enrol/index.ts");
  const facial = await read("../verify-vai-facial/index.ts");
  const sig = await read("../verify-facial-signature/index.ts");
  if (!/getSettingNumber\(supabase,\s*"enrol_session_hours"\)/.test(enrol)) {
    throw new Error("enrol session hours from settings");
  }
  if (/24 \* 60 \* 60 \* 1000/.test(enrol)) {
    throw new Error("enrol must not hardcode 24h");
  }
  if (!/facial_attempt_window_minutes/.test(facial)) {
    throw new Error("facial attempt window from settings");
  }
  if (/10 \* 60 \* 1000/.test(facial)) {
    throw new Error("facial must not hardcode 10 minutes");
  }
  if (!/facial_signature_window_minutes/.test(sig)) {
    throw new Error("signature window from settings");
  }
  if (/5 \* 60 \* 1000/.test(sig)) {
    throw new Error("signature must not hardcode 5 minutes");
  }
});

Deno.test("deferral suspend reads deferral_suspend_after; reveal stamps expires", async () => {
  const helper = await read("../_shared/deferral-suspend.ts");
  const renew = await read("../check-renewals/index.ts");
  const reveal = await read("../enrol-reveal/index.ts");
  if (!helper.includes("deferral_suspend_after") || !helper.includes("getSettingNumber")) {
    throw new Error(
      `suspend helper reads setting (len=${helper.length} head=${JSON.stringify(helper.slice(0, 80))})`
    );
  }
  if (!renew.includes("suspendExpiredDeferrals")) {
    throw new Error("check-renewals runs deferral suspend");
  }
  if (!reveal.includes("deferral_expires_at") || !reveal.includes("deferral_used")) {
    throw new Error("reveal must stamp deferral on deferred pay");
  }
});

Deno.test("migration adds reds_count and recovery_otp_max_attempts UNSET", async () => {
  const mig = await Deno.readTextFile(
    new URL(
      "../../migrations/20260824120000_reds_count_and_otp_attempts.sql",
      import.meta.url
    )
  );
  if (!/reds_count/.test(mig)) throw new Error("reds_count column");
  if (!/'recovery_otp_max_attempts', 'UNSET'/.test(mig)) {
    throw new Error("OTP key seeded UNSET");
  }
  if (/'[0-9]/.test(mig.slice(mig.indexOf("INSERT")))) {
    throw new Error("must not invent a figure in INSERT");
  }
});

Deno.test("migration seeds session and facial window keys UNSET", async () => {
  const mig = await Deno.readTextFile(
    new URL(
      "../../migrations/20260824130000_session_and_facial_windows.sql",
      import.meta.url
    )
  );
  if (!/'enrol_session_hours', 'UNSET'/.test(mig)) throw new Error("session hours");
  if (!/'facial_attempt_window_minutes', 'UNSET'/.test(mig)) {
    throw new Error("facial attempt window");
  }
  if (/'[0-9]/.test(mig.slice(mig.indexOf("INSERT")))) {
    throw new Error("must not invent a figure in INSERT");
  }
});

Deno.test("EnrolHandoff poll interval is settings:handoff_poll_window", async () => {
  const page = await read("../../../src/pages/EnrolHandoff.tsx");
  if (!/handoff_poll_window/.test(page)) {
    throw new Error("handoff poll from settings");
  }
  if (!/getSettingNumber\("handoff_poll_window"\)/.test(page)) {
    throw new Error("page must load handoff_poll_window");
  }
});

Deno.test("contracts FacialVerification uses attempt_count_n; no 95% skip", async () => {
  const page = await read("../../../src/components/contracts/FacialVerification.tsx");
  if (!/attempt_count_n/.test(page)) throw new Error("attempt_count_n");
  if (/attempts\s*>=\s*3/.test(page)) throw new Error("no hardcoded attempts >= 3");
  if (/onVerificationSuccess\(95\)/.test(page)) {
    throw new Error("no invented 95% bypass");
  }
});
