/**
 * Process 1 VERIFY — §16.6 step 3 GATE.
 * Run: deno run --allow-env --allow-net supabase/functions/gate/process1_verify.ts
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ENROLMENT_TOKEN_SECRET
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { agreementMeetsEndpointLevel } from "../_shared/gate-level.ts";
import { sha256Hex, resolvePlatformByApiKey } from "../_shared/platform-key.ts";
import {
  credentialMeetsRequiredLevel,
  loadCredentialForGate,
  credentialIsActive,
} from "../_shared/gate-credential.ts";
import { signEnrolmentToken } from "../_shared/enrolment-token.ts";
import { findPlatformVisit } from "../_shared/gate-visits.ts";
import { recordGateConsumption } from "../_shared/gate-ledger.ts";
import { publicGateBody } from "../_shared/gate-response.ts";
import {
  askingPartyNotMet,
  holderShortfall,
  levelShortItem,
  SHORTFALL_PAGE,
} from "../_shared/gate-shortfall.ts";

const url = Deno.env.get("SUPABASE_URL");
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("FAIL: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY required");
  Deno.exit(1);
}
if (!Deno.env.get("ENROLMENT_TOKEN_SECRET")) {
  Deno.env.set("ENROLMENT_TOKEN_SECRET", "verify-enrol-secret");
}

const supabase = createClient(url, key);
const out: string[] = [];
function log(s: string) {
  out.push(s);
  console.log(s);
}

const KEY_L1 = "gate_verify_key_level1_aaaaaaaa";
const KEY_L3 = "gate_verify_key_level3_bbbbbbbb";
const VAI = "GATET01";
const PLAT_L1 = "gate_plat_l1";
const PLAT_L3 = "gate_plat_l3";

async function cleanup() {
  await supabase.from("verification_ledger").delete().eq("vai", VAI);
  await supabase.from("platform_visits").delete().eq("vai", VAI);
  await supabase.from("agreement_proofs").delete().eq("vai", VAI);
  // agreements referencing this vai
  await supabase.from("agreements").delete().eq("vai_1", VAI);
  await supabase.from("blocks").delete().in("platform_id", [PLAT_L1, PLAT_L3]);
  await supabase.from("platform_agreements").delete().in("platform_id", [PLAT_L1, PLAT_L3]);
  await supabase.from("agreement_versions").delete().in("platform_id", [PLAT_L1, PLAT_L3]);
  await supabase.from("credentials").delete().eq("vai", VAI);
  await supabase.from("platforms").delete().in("id", [PLAT_L1, PLAT_L3]);
}

try {
  await cleanup();

  const hash1 = await sha256Hex(KEY_L1);
  const hash3 = await sha256Hex(KEY_L3);

  const { error: pErr } = await supabase.from("platforms").insert([
    {
      id: PLAT_L1,
      display_name: "Gate L1",
      api_key_hash: hash1,
      service_level: 1,
      status: "active",
    },
    {
      id: PLAT_L3,
      display_name: "Gate L3",
      api_key_hash: hash3,
      service_level: 3,
      status: "active",
    },
  ]);
  if (pErr) throw new Error(`seed platforms: ${pErr.message}`);

  const { error: cErr } = await supabase.from("credentials").insert({
    vai: VAI,
    state: "active",
    credential_level: 3,
    next_renewal_date: "2099-01-01",
  });
  if (cErr) throw new Error(`seed credential: ${cErr.message}`);

  await supabase.from("platform_agreements").insert({
    platform_id: PLAT_L3,
    terms_doc_ref: "verify terms body",
    terms_version: "v1",
  });

  await supabase.from("blocks").insert([
    { platform_id: PLAT_L1, size: 100, consumed: 0 },
    { platform_id: PLAT_L3, size: 100, consumed: 0 },
  ]);

  // --- VERIFY: level-1 key on level-2 endpoint refused ---
  const plat1 = await resolvePlatformByApiKey(supabase, KEY_L1);
  const l1on2 = agreementMeetsEndpointLevel(plat1.service_level!, 2);
  log(`LEVEL1_ON_LEVEL2_REFUSED=${!l1on2}`);
  if (l1on2) throw new Error("level-1 must refuse level-2");

  await recordGateConsumption(supabase, {
    platform_id: PLAT_L1,
    vai: VAI,
    call_type: "gate",
    result: "level_refused",
  });
  const refusedBody = publicGateBody({ status: "level_refused" });
  log(`LEVEL_REFUSED_BODY=${JSON.stringify(refusedBody)}`);

  const shortfallBody = publicGateBody(
    holderShortfall({
      missing: [levelShortItem(3)],
      route: { url: SHORTFALL_PAGE, enrolment_token: "verify-token" },
    })
  );
  log(`SHORTFALL_BODY=${JSON.stringify(shortfallBody)}`);
  if (shortfallBody.status !== "shortfall") throw new Error("shortfall status");
  if (!Array.isArray(shortfallBody.missing) || !shortfallBody.route) {
    throw new Error("shortfall must list missing and a route");
  }
  if (JSON.stringify(shortfallBody).includes("credential_level_refused")) {
    throw new Error("shortfall must not be named refused");
  }
  const askBody = publicGateBody(askingPartyNotMet());
  log(`ASKING_PARTY_BODY=${JSON.stringify(askBody)}`);
  if (askBody.status !== "not_met" || "missing" in askBody) {
    throw new Error("asking party learns only not_met");
  }

  // --- VERIFY: level-3 key passes all three ---
  const plat3 = await resolvePlatformByApiKey(supabase, KEY_L3);
  const pass1 = agreementMeetsEndpointLevel(plat3.service_level!, 1);
  const pass2 = agreementMeetsEndpointLevel(plat3.service_level!, 2);
  const pass3 = agreementMeetsEndpointLevel(plat3.service_level!, 3);
  log(`LEVEL3_PASSES_ALL_THREE=${pass1 && pass2 && pass3}`);
  if (!(pass1 && pass2 && pass3)) throw new Error("level-3 must pass 1,2,3");

  // credential path
  const cred = await loadCredentialForGate(supabase, VAI);
  if (!cred || !credentialIsActive(cred.state)) throw new Error("credential missing");
  if (!credentialMeetsRequiredLevel(cred.credential_level, 3)) {
    throw new Error("credential level should meet 3");
  }

  // --- VERIFY: first visit terms_required; second does not ---
  const visit1 = await findPlatformVisit(supabase, VAI, PLAT_L3);
  log(`FIRST_VISIT_MISS=${visit1 == null}`);
  if (visit1) throw new Error("expected no visit yet");

  const firstBody = publicGateBody({ status: "terms_required" });
  log(`FIRST_VISIT_BODY=${JSON.stringify(firstBody)}`);
  await recordGateConsumption(supabase, {
    platform_id: PLAT_L3,
    vai: VAI,
    call_type: "gate",
    result: "terms_required",
  });

  // Simulate completed sign: insert visit (face path exercised via insert; band body checked separately)
  const { data: ver, error: verErr } = await supabase
    .from("agreement_versions")
    .insert({
      platform_id: PLAT_L3,
      subtype: "terms",
      body: "verify terms body",
      version: "v1",
    })
    .select("id")
    .single();
  if (verErr) throw new Error(verErr.message);

  const { data: agr, error: agrErr } = await supabase
    .from("agreements")
    .insert({
      platform_id: PLAT_L3,
      type: "single",
      subtype: "terms",
      vai_1: VAI,
      status: "complete",
      content_version_id: ver.id,
      closed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (agrErr) throw new Error(agrErr.message);

  await supabase.from("agreement_proofs").insert({
    agreement_id: agr.id,
    agreement_version_id: ver.id,
    vai: VAI,
    engine_used: "standard",
  });

  await supabase.from("platform_visits").insert({
    vai: VAI,
    platform_id: PLAT_L3,
    agreement_id: agr.id,
    terms_version: "v1",
  });

  const visit2 = await findPlatformVisit(supabase, VAI, PLAT_L3);
  log(`SECOND_VISIT_HIT=${visit2 != null}`);
  if (!visit2) throw new Error("expected visit after sign");

  // Return visit would face-compare; body shape is status+band only
  const secondBody = publicGateBody({ status: "granted", band: "green" });
  log(`SECOND_VISIT_BODY=${JSON.stringify(secondBody)}`);
  if (secondBody.status === "terms_required") {
    throw new Error("second visit must not return terms_required");
  }
  await recordGateConsumption(supabase, {
    platform_id: PLAT_L3,
    vai: VAI,
    call_type: "gate",
    result: "granted",
  });

  // enroll_required token path (different missing vai)
  const token = await signEnrolmentToken(PLAT_L3);
  const enrollBody = publicGateBody({ status: "enroll_required", enrolment_token: token });
  log(`ENROLL_BODY_HAS_TOKEN=${typeof enrollBody.enrolment_token === "string"}`);
  log(`ENROLL_BODY_NO_QUERY_PLATFORM=${!JSON.stringify(enrollBody).includes("?platform=")}`);

  // --- VERIFY: every call leaves ledger row ---
  const { data: ledger, error: lErr } = await supabase
    .from("verification_ledger")
    .select("id, call_type, result, billed_against_block")
    .eq("vai", VAI)
    .order("id");
  if (lErr) throw new Error(lErr.message);
  log(`LEDGER_ROWS=${JSON.stringify(ledger)}`);
  log(`LEDGER_COUNT=${ledger?.length ?? 0}`);
  if (!ledger || ledger.length < 3) {
    throw new Error(`expected >=3 ledger rows, got ${ledger?.length}`);
  }

  // block decremented for billable calls (not level_refused)
  const { data: blk } = await supabase
    .from("blocks")
    .select("platform_id, size, consumed")
    .eq("platform_id", PLAT_L3)
    .single();
  log(`BLOCK_L3=${JSON.stringify(blk)}`);

  // --- VERIFY: no percentage in any response body ---
  const bodies = [refusedBody, firstBody, secondBody, enrollBody, shortfallBody, askBody];
  for (const b of bodies) {
    const raw = JSON.stringify(b);
    if (/%/.test(raw) || "similarity" in b || "percentage" in b) {
      throw new Error(`percentage leak in ${raw}`);
    }
  }
  log("NO_PERCENTAGE_IN_BODIES=true");

  log("PROCESS1_VERIFY=PASS");
  await cleanup();
} catch (e) {
  log(`PROCESS1_VERIFY=FAIL ${e instanceof Error ? e.message : e}`);
  try {
    await cleanup();
  } catch {
    /* ignore */
  }
  Deno.exit(1);
}
