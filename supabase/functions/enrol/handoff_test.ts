/**
 * Handoff: S2S payload carries the session key; browser JSON does not.
 * deno test --allow-read supabase/functions/enrol/handoff_test.ts
 */
import { serverToServerPayload } from "../_shared/enrol-handoff.ts";
import { generateSessionKey } from "../_shared/session-key.ts";

Deno.test("enrol-handoff deletes session_key after the S2S POST", async () => {
  const text = await Deno.readTextFile(
    new URL("../enrol-handoff/index.ts", import.meta.url)
  );
  if (!/provider_session_key:\s*null/.test(text)) {
    throw new Error("handoff must null provider_session_key (§2.4a)");
  }
  if (!/session_key:\s*null/.test(text)) {
    throw new Error("handoff must null sessions.session_key and credential_keys.session_key");
  }
  if (!/superseded_at/.test(text)) {
    throw new Error("handoff must keep the credential_keys row (superseded_at stamped)");
  }
  if (!/status:\s*["']no_longer_held["']/.test(text)) {
    throw new Error("re-handoff must return no_longer_held");
  }
  if (/legal_name|full_name|first_name|last_name/.test(text)) {
    throw new Error("handoff must not carry legal name fields (§2.9)");
  }
  if (!/serverToServerPayload/.test(text)) {
    throw new Error("handoff must POST the server-to-server payload");
  }
  if (/payload,/.test(text) && /return json\(\{[\s\S]*payload/.test(text)) {
    const ret = text.slice(text.lastIndexOf("return json({"));
    if (/payload/.test(ret) && /session_key: payload/.test(ret)) {
      throw new Error("browser JSON must not return the S2S payload");
    }
  }
});

Deno.test("server-to-server payload is V.A.I. + session key + contact + T&C", () => {
  const session_key = generateSessionKey();
  const payload = serverToServerPayload({
    vai: "ABC12DE",
    session_key,
    username: "neo",
    contact_email: "a@b.c",
    contact_phone: null,
    terms_accepted_at: "2026-08-25T00:00:00Z",
  });
  console.log(JSON.stringify(payload, null, 2));
  if (payload.session_key.length !== 30) throw new Error("session key is 30");
  if (payload.vai !== "ABC12DE") throw new Error("vai");
  if (payload.terms_affirmed !== true) throw new Error("terms_affirmed");
});

Deno.test("handoff completes at step 13 and refuses without security", async () => {
  const text = await Deno.readTextFile(
    new URL("../enrol-handoff/index.ts", import.meta.url)
  );
  if (!/enrolment_step:\s*13/.test(text) || !/step:\s*13/.test(text)) {
    throw new Error("handoff must complete at step 13");
  }
  if (!/no_longer_held/.test(text) || !/step:\s*13/.test(text)) {
    throw new Error("no_longer_held must use step 13");
  }
  if (!/security_required_before_handoff/.test(text)) {
    throw new Error("handoff must refuse without security rows");
  }
  if (!/getSettingNumber\(supabase,\s*"security_question_count"\)/.test(text)) {
    throw new Error("handoff must read security_question_count");
  }
  if (!/getSettingNumber\(supabase,\s*"recovery_code_count"\)/.test(text)) {
    throw new Error("handoff must read recovery_code_count");
  }
  if (/\(qCount ?? 0\) < 3/.test(text)) {
    throw new Error("handoff must not hardcode question count 3");
  }
  if (/kyc_match_percent/.test(text)) {
    throw new Error("handoff must never return KYC percentage");
  }
});
