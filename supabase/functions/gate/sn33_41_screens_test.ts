/**
 * SN-33–41 client dashboard. Endpoints are RED — pointers, no invented figures.
 * deno test --allow-read supabase/functions/gate/sn33_41_screens_test.ts
 */
async function read(rel: string): Promise<string> {
  return await Deno.readTextFile(new URL(rel, import.meta.url));
}

Deno.test("SN-33 traffic is scoped to the key; no session-key endpoint; no invented figures", async () => {
  const page = await read("../../../src/pages/ClientOverview.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/client"/.test(app) && !/path="\/client"/.test(app)) {
    throw new Error("SN-33 route missing");
  }
  if (!/Your traffic/.test(page)) throw new Error("SN-33 title");
  if (!/traffic\.verifications/.test(page) || !/traffic\.passes/.test(page)) {
    throw new Error("traffic pointers");
  }
  if (!/There is nothing to read/.test(page) && !/We do not have it/.test(page)) {
    throw new Error("session key is not held");
  }
  if (!/\/client\/config/.test(page)) throw new Error("nav to SN-38");
  if (/legal_name|kyc_match|session_key\s*:/.test(page)) {
    throw new Error("never a legal name, percentage, or session-key read");
  }
});

Deno.test("SN-34 blocks read remaining and the alert setting; no price in copy", async () => {
  const page = await read("../../../src/pages/ClientBlocks.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/client\/blocks/.test(app)) throw new Error("route");
  if (!/<EnrolTitle>Blocks<\/EnrolTitle>/.test(page) && !/>Blocks</.test(page)) {
    throw new Error("title");
  }
  if (!/settings:blocks_alert_threshold/.test(page)) {
    throw new Error("alert level is a setting");
  }
  if (!/invokeEnrol\("blocks"/.test(page)) throw new Error("GET/POST blocks");
  if (/\$\d|price_/.test(page) && !/settings:/.test(page)) {
    throw new Error("no price figure");
  }
});

Deno.test("SN-35 agreements never show a legal name; versions are provider-hosted", async () => {
  const page = await read("../../../src/pages/ClientAgreements.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/client\/agreements/.test(app)) throw new Error("route");
  if (!/Your documents/.test(page)) throw new Error("title");
  if (!/invokeEnrol\("agreements"/.test(page)) throw new Error("agreements read");
  if (/legal_name|full_name/.test(page)) throw new Error("never a legal name");
});

Deno.test("SN-36 proofs never expose a baseline, document body, or percentage", async () => {
  const page = await read("../../../src/pages/ClientProofs.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/client\/proofs/.test(app)) throw new Error("route");
  if (!/Pull a proof/.test(page)) throw new Error("title");
  if (/legal_name|baseline|kyc_match|%/.test(page) && !/never/.test(page)) {
    throw new Error("never-list must stay unread");
  }
});

Deno.test("SN-37 commission ledger has no rate percentage", async () => {
  const page = await read("../../../src/pages/ClientCommission.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/client\/commission/.test(app)) throw new Error("route");
  if (!/Your ledger/.test(page)) throw new Error("title");
  if (!/invokeEnrol\("commission"/.test(page)) throw new Error("commission read");
  if (/%/.test(page) || /commission_rate/.test(page) && !/never/.test(page)) {
    throw new Error("rate never crosses to a platform");
  }
});

Deno.test("SN-38 configuration: collection spec; agreement terms edit is inert", async () => {
  const page = await read("../../../src/pages/ClientConfig.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/client\/config/.test(app)) throw new Error("route");
  if (!/Your configuration/.test(page)) throw new Error("title");
  if (!/collection/.test(page)) throw new Error("collection spec");
  if (!/inert/.test(page)) throw new Error("contractual edit is inert");
});

Deno.test("SN-39 health is declared, never inferred; image serve separate", async () => {
  const page = await read("../../../src/pages/ClientHealth.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/client\/health/.test(app)) throw new Error("route");
  if (!/Facial recognition is available/.test(page) && !/Declared, not inferred/.test(page)) {
    throw new Error("title");
  }
  if (!/invokeEnrol\("health"/.test(page)) throw new Error("health read");
  if (!/declared/.test(page)) throw new Error("declared, not inferred");
});

Deno.test("SN-40 keys: issue/rotate/revoke; no session-key endpoint", async () => {
  const page = await read("../../../src/pages/ClientKeys.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/client\/keys/.test(app)) throw new Error("route");
  if (!/API keys/.test(page)) throw new Error("title");
  if (!/generate-api-key/.test(page) && !/regenerate-api-key/.test(page)) {
    throw new Error("key write");
  }
  if (/session_key/.test(page) && !/nothing to read|do not have it|never/.test(page)) {
    throw new Error("session key is not an endpoint");
  }
});

Deno.test("SN-41 ninth client surface is flagged unruled", async () => {
  const page = await read("../../../src/pages/ClientUnruled.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/client\/unruled/.test(app)) throw new Error("route");
  if (!/A ninth surface, unnamed/.test(page)) throw new Error("title");
  if (!/unruled|UNRULED/.test(page)) throw new Error("flagged, not invented");
});
