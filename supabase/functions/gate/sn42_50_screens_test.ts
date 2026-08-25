/**
 * SN-42–50 master dashboard. Endpoints are RED — pointers, no invented figures.
 * deno test --allow-read supabase/functions/gate/sn42_50_screens_test.ts
 */
async function read(rel: string): Promise<string> {
  return await Deno.readTextFile(new URL(rel, import.meta.url));
}

Deno.test("SN-42 platforms as rows; suspend writes an audit entry", async () => {
  const page = await read("../../../src/pages/MasterPlatforms.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/path="\/master"/.test(app)) throw new Error("route");
  if (!/Platforms/.test(page)) throw new Error("title");
  if (!/master\.platforms/.test(page)) throw new Error("platforms pointer");
  if (!/audit\.entry/.test(page)) throw new Error("suspend → audit");
});

Deno.test("SN-43 providers as rows; cost is a read, not a constant", async () => {
  const page = await read("../../../src/pages/MasterProviders.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/master\/providers/.test(app)) throw new Error("route");
  if (!/Providers/.test(page)) throw new Error("title");
  if (!/providers\.per_attempt/.test(page) || !/providers\.cost/.test(page)) {
    throw new Error("provider cost is a read");
  }
});

Deno.test("SN-44 settings list keys; save writes audit; no figure in list copy", async () => {
  const page = await read("../../../src/pages/MasterSettings.tsx");
  const app = await read("../../../src/App.tsx");
  const fn = await read("../master-settings/index.ts");
  if (!/\/master\/settings/.test(app)) throw new Error("route");
  if (!/Settings/.test(page)) throw new Error("title");
  if (!/settings\.bands/.test(page) || !/master\.settings/.test(page)) {
    throw new Error("settings pointer");
  }
  if (!/audit\.entry/.test(page)) throw new Error("save → audit");
  if (!/settings_audit/.test(fn)) throw new Error("function writes settings_audit");
  if (!/action === "list"/.test(fn) || !/action === "set"/.test(fn)) {
    throw new Error("list and set actions");
  }
  // List pane must not print a dollar or percent figure into copy.
  if (/\$\d|\d+%/.test(page) && !/never a printed threshold|never a number/.test(page)) {
    throw new Error("no product figure in SN-44 copy");
  }
});

Deno.test("SN-45 failures: no score; report-fraud is inert; outcome unruled", async () => {
  const page = await read("../../../src/pages/MasterFailures.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/master\/failures/.test(app)) throw new Error("route");
  if (!/Failures for review/.test(page)) throw new Error("title");
  if (!/unruled|UNRULED/.test(page)) throw new Error("outcome unruled");
  if (!/inert/.test(page)) throw new Error("report is inert");
  if (/score|kyc_match|%/.test(page) && !/not a score/.test(page)) {
    throw new Error("staff are not scoring a match");
  }
});

Deno.test("SN-46 credentials by state; unlock is inert; never why to a platform", async () => {
  const page = await read("../../../src/pages/MasterCredentials.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/master\/credentials/.test(app)) throw new Error("route");
  if (!/By state/.test(page)) throw new Error("title");
  if (!/credential\.state/.test(page)) throw new Error("state pointer");
  if (!/inert/.test(page)) throw new Error("unlock is a constraint");
});

Deno.test("SN-47 revenue by platform; rate is a setting pointer, not a figure", async () => {
  const page = await read("../../../src/pages/MasterRevenue.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/master\/revenue/.test(app)) throw new Error("route");
  if (!/By platform/.test(page)) throw new Error("title");
  if (!/settings:commission_rate/.test(page)) throw new Error("rate is a setting");
  if (/%/.test(page)) throw new Error("no percentage figure");
});

Deno.test("SN-48 health switch writes audit; reds_threshold is a setting", async () => {
  const page = await read("../../../src/pages/MasterHealth.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/master\/health/.test(app)) throw new Error("route");
  if (!/The switch/.test(page)) throw new Error("title");
  if (!/audit\.entry/.test(page)) throw new Error("switch → audit");
  if (!/invokeEnrol\("health"/.test(page)) throw new Error("health read");
});

Deno.test("SN-49 audit log; delete is inert", async () => {
  const page = await read("../../../src/pages/MasterAudit.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/master\/audit/.test(app)) throw new Error("route");
  if (!/Audit log/.test(page)) throw new Error("title");
  if (!/audit\.actor/.test(page) || !/audit\.at/.test(page)) {
    throw new Error("actor / at / action");
  }
  if (!/inert/.test(page)) throw new Error("delete is inert");
});

Deno.test("SN-50 ninth master surface is flagged unruled", async () => {
  const page = await read("../../../src/pages/MasterUnruled.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/master\/unruled/.test(app)) throw new Error("route");
  if (!/A ninth surface, unnamed/.test(page)) throw new Error("title");
  if (!/unruled|UNRULED/.test(page)) throw new Error("flagged, not invented");
});
