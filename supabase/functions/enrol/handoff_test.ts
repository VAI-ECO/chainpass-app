/**
 * Handoff deletes session key once; payload is V.A.I. + username + email/phone only.
 * deno test --allow-read supabase/functions/enrol/handoff_test.ts
 */
Deno.test("enrol-handoff deletes provider_session_key and omits legal name", async () => {
  const text = await Deno.readTextFile(
    new URL("../enrol-handoff/index.ts", import.meta.url)
  );
  if (!/provider_session_key:\s*null/.test(text)) {
    throw new Error("handoff must null provider_session_key (§2.4a)");
  }
  if (!/session_key:\s*null/.test(text)) {
    throw new Error("handoff must null credential_keys.session_key (§2.4a)");
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
  const payloadMatch = text.match(/const payload = \{([\s\S]*?)\};/);
  if (!payloadMatch) throw new Error("payload object missing");
  const payload = payloadMatch[1];
  if (!/vai:/.test(payload) || !/username:/.test(payload) || !/email:/.test(payload) || !/phone:/.test(payload)) {
    throw new Error("payload must be V.A.I. + username + email/phone");
  }
  if (/session_key/.test(payload)) {
    throw new Error("session_key must not ride in the browser payload");
  }
});
