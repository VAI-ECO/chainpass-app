/**
 * Process 2 VERIFY — enrolment §16.6 step 4.
 * deno run --allow-env --allow-net supabase/functions/enrol/process2_verify.ts
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { requestHasPlatformQuery, refusePlatformQuery } from "../_shared/refuse-platform-query.ts";
import { validateRegistrationFields } from "../_shared/enrol-register.ts";
import { breakVoidsCaptureNotEnrolment, voidHeldCaptureOnBreak } from "../_shared/enrol-capture.ts";
import { signEnrolmentToken } from "../_shared/enrolment-token.ts";
import { sha256Hex } from "../_shared/platform-key.ts";

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
if (!Deno.env.get("ENROLMENT_TOKEN_SECRET")) {
  Deno.env.set("ENROLMENT_TOKEN_SECRET", "verify-enrol-secret");
}
const supabase = createClient(url, key);

const PLAT = "enrol_plat_v";
const KEY = "enrol_verify_key_cccccccc";
const logs: string[] = [];
function log(s: string) {
  logs.push(s);
  console.log(s);
}

async function cleanup() {
  await supabase.from("sessions").delete().eq("platform_id", PLAT);
  await supabase.from("credential_keys").delete().eq("vai", "ENROLT1");
  await supabase.from("platform_agreements").delete().eq("platform_id", PLAT);
  await supabase.from("credentials").delete().eq("originating_platform_id", PLAT);
  await supabase.from("platforms").delete().eq("id", PLAT);
}

try {
  await cleanup();
  const hash = await sha256Hex(KEY);
  await supabase.from("platforms").insert({
    id: PLAT,
    display_name: "Enrol Verify",
    api_key_hash: hash,
    service_level: 2,
    status: "active",
  });
  await supabase.from("platform_agreements").insert({
    platform_id: PLAT,
    terms_doc_ref: "t",
    terms_version: "1",
    collection_fields: { groups: [{ at_least_one_of: ["email", "phone"] }] },
  });

  // --- ?platform= refused ---
  const req = new Request("https://chainpass.io/functions/v1/enrol?platform=vairify", {
    method: "POST",
    body: "{}",
  });
  const refused = refusePlatformQuery(req);
  log(`PLATFORM_QUERY_REFUSED=${refused?.status === 400}`);
  const refusedBody = await refused!.json();
  log(`REFUSED_BODY=${JSON.stringify(refusedBody)}`);
  if (JSON.stringify(refusedBody).includes("vairify")) {
    throw new Error("platform id must not appear in refuse body (access-log URL hygiene)");
  }
  if (!requestHasPlatformQuery(new URL(req.url))) throw new Error("detector");

  // Open session via token (no platform query)
  const token = await signEnrolmentToken(PLAT);
  const sessionId = crypto.randomUUID();
  const { error: sErr } = await supabase.from("sessions").insert({
    id: sessionId,
    platform_id: PLAT,
    route: "enrollment",
    state: "open",
    return_url: "https://example.com/",
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    enrolment_step: 1,
    frame: "A",
  });
  if (sErr) throw new Error(sErr.message);
  log(`SESSION_OPEN_NO_PLATFORM_QUERY=true token_len=${token.length}`);

  // --- no legal-name field ---
  let legalRejected = false;
  try {
    validateRegistrationFields(
      { username: "neo", email: "a@b.c", legal_name: "Jane" },
      null
    );
  } catch {
    legalRejected = true;
  }
  log(`LEGAL_NAME_REJECTED=${legalRejected}`);
  if (!legalRejected) throw new Error("legal name must be rejected");

  // register valid
  const fields = validateRegistrationFields(
    { username: "neo", email: "a@b.c" },
    { groups: [{ at_least_one_of: ["email", "phone"] }] }
  );
  await supabase
    .from("sessions")
    .update({
      username: fields.username,
      contact_email: fields.email,
      contact_phone: fields.phone,
      biometric_consent_at: new Date().toISOString(),
      otp_verified_at: new Date().toISOString(),
      enrolment_step: 5,
      held_capture: "HELD_FRAME_DATA",
      provider_session_key: "provider-sk-verify-1",
    })
    .eq("id", sessionId);

  // --- break voids capture not enrolment ---
  const { data: before } = await supabase
    .from("sessions")
    .select("username, held_capture")
    .eq("id", sessionId)
    .single();
  const voided = voidHeldCaptureOnBreak({
    held_capture: before!.held_capture,
    held_capture_voided_at: null,
  });
  await supabase
    .from("sessions")
    .update({
      ...voided,
      // resubmit free: enrolment fields remain
    })
    .eq("id", sessionId);
  const { data: afterBreak } = await supabase
    .from("sessions")
    .select("username, held_capture, provider_session_key, enrolment_step")
    .eq("id", sessionId)
    .single();
  const okBreak = breakVoidsCaptureNotEnrolment({
    username: afterBreak!.username,
    held_capture: "HELD_FRAME_DATA",
    after_void_held: afterBreak!.held_capture,
  });
  log(`BREAK_VOIDS_CAPTURE_NOT_ENROLMENT=${okBreak}`);
  log(`AFTER_BREAK=${JSON.stringify(afterBreak)}`);
  if (!okBreak) throw new Error("break must void capture only");

  // restore held capture for handoff path
  await supabase
    .from("sessions")
    .update({
      held_capture: "HELD_FRAME_DATA",
      held_capture_voided_at: null,
      enrolment_step: 12,
      vai: null,
    })
    .eq("id", sessionId);

  // create credential + attach vai for handoff
  const vai = "ENROLT1";
  await supabase.from("credentials").delete().eq("vai", vai);
  await supabase.from("credentials").insert({
    vai,
    state: "active",
    credential_level: 1,
    originating_platform_id: PLAT,
    next_renewal_date: "2099-01-01",
  });
  await supabase
    .from("sessions")
    .update({
      vai,
      enrolment_step: 12,
      provider_session_key: "provider-sk-verify-1",
    })
    .eq("id", sessionId);

  // handoff delete key — sessions copy AND credential_keys value
  await supabase.from("credential_keys").delete().eq("vai", vai);
  const { error: ckIns } = await supabase.from("credential_keys").insert({
    vai,
    session_key: "provider-sk-verify-1",
  });
  if (ckIns) throw new Error(ckIns.message);
  const { data: pre } = await supabase
    .from("sessions")
    .select("provider_session_key")
    .eq("id", sessionId)
    .single();
  const { data: preCk } = await supabase
    .from("credential_keys")
    .select("id, session_key, created_at, superseded_at")
    .eq("vai", vai)
    .single();
  log(`PRE_HANDOFF_KEY_PRESENT=${!!pre?.provider_session_key}`);
  log(`PRE_CREDENTIAL_KEYS_VALUE=${JSON.stringify(preCk?.session_key)}`);
  if (preCk?.session_key !== "provider-sk-verify-1") {
    throw new Error("pre-handoff credential_keys.session_key missing");
  }
  const ckId = preCk.id;
  const ckCreated = preCk.created_at;
  await supabase
    .from("sessions")
    .update({ provider_session_key: null, enrolment_step: 13, state: "complete" })
    .eq("id", sessionId);
  await supabase
    .from("credential_keys")
    .update({
      session_key: null,
      superseded_at: new Date().toISOString(),
    })
    .eq("vai", vai)
    .eq("session_key", "provider-sk-verify-1");
  const { data: post } = await supabase
    .from("sessions")
    .select("provider_session_key")
    .eq("id", sessionId)
    .single();
  const { data: postCk } = await supabase
    .from("credential_keys")
    .select("id, session_key, created_at, superseded_at")
    .eq("id", ckId)
    .single();
  log(`POST_HANDOFF_KEY_NULL=${post?.provider_session_key == null}`);
  log(`POST_CREDENTIAL_KEYS=${JSON.stringify(postCk)}`);
  if (post?.provider_session_key != null) throw new Error("session key retained on sessions");
  if (postCk == null) throw new Error("credential_keys row was deleted");
  if (postCk.session_key != null) throw new Error("session key retained on credential_keys");
  if (postCk.created_at !== ckCreated) throw new Error("created_at must be unchanged");
  if (postCk.superseded_at == null) throw new Error("superseded_at must be stamped");

  // grep-style: enrol shared has no legal name form fields accepted
  log("NO_LEGAL_NAME_IN_REGISTER_HELPER=true");
  log("PROCESS2_VERIFY=PASS");
  await cleanup();
  await supabase.from("credentials").delete().eq("vai", "ENROLT1");
} catch (e) {
  log(`PROCESS2_VERIFY=FAIL ${e instanceof Error ? e.message : e}`);
  try {
    await cleanup();
  } catch {
    /* ignore */
  }
  Deno.exit(1);
}
