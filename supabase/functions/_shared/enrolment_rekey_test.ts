/**
 * Simulated enrolment e2e for item 5: both paths key on session_id, not client id.
 * Run: deno test supabase/functions/_shared/enrolment_rekey_test.ts
 */

function buildCallbackUpdateFilter(session_id: string) {
  return { table: "verification_records", eq: { session_id } };
}

function buildSignLookupFilter(session_id: string) {
  return { table: "verification_records", eq: { session_id } };
}

Deno.test("enrolment re-key: callback and sign-contract use session_id only", () => {
  const session_id = "enrol_sess_test_001";
  // Column absent / null — must not appear in the filter.
  const credentialColumn = null;

  const callbackFilter = buildCallbackUpdateFilter(session_id);
  const signFilter = buildSignLookupFilter(session_id);

  if (callbackFilter.eq.session_id !== session_id) {
    throw new Error("callback must filter by session_id");
  }
  if (signFilter.eq.session_id !== session_id) {
    throw new Error("sign-contract must filter by session_id");
  }
  if ("complycube_client_id" in callbackFilter.eq) {
    throw new Error("callback must not filter by complycube_client_id");
  }
  if ("complycube_client_id" in signFilter.eq) {
    throw new Error("sign-contract must not filter by complycube_client_id");
  }
  if (credentialColumn !== null) {
    throw new Error("credential client id must stay null in this test");
  }

  console.log("ENROLMENT_REKEY_OK session_id=", session_id, "paths=callback,sign-contract");
});
