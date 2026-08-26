/**
 * §11.2 / §11.4 — shortfall is a list and a route, never credential_level_refused.
 * deno test --allow-read --allow-env supabase/functions/gate/shortfall_test.ts
 */
import {
  askingPartyNotMet,
  assertAccessVaiRequirementCap,
  holderShortfall,
  levelShortItem,
  SHORTFALL_PAGE,
} from "../_shared/gate-shortfall.ts";
import { publicGateBody } from "../_shared/gate-response.ts";

Deno.test("never credential_level_refused in gate product files", async () => {
  const gate = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
  const sign = await Deno.readTextFile(
    new URL("../gate-sign/index.ts", import.meta.url)
  );
  if (/credential_level_refused/.test(gate) || /credential_level_refused/.test(sign)) {
    throw new Error("gate must not return credential_level_refused");
  }
});

Deno.test("holder shortfall body has missing[] + route; no percentage", () => {
  const body = publicGateBody(
    holderShortfall({
      missing: [levelShortItem(3), { kind: "platform_requirement", key: "le_declaration" }],
      route: { url: SHORTFALL_PAGE, enrolment_token: "tok" },
    })
  );
  if (body.status !== "shortfall") throw new Error("status");
  if (!Array.isArray(body.missing) || body.missing.length !== 2) {
    throw new Error("missing[] required");
  }
  const route = body.route as { url?: string };
  if (!route || route.url !== SHORTFALL_PAGE) throw new Error("route required");
  const raw = JSON.stringify(body);
  if (/%/.test(raw) || /percentage|kyc_match/.test(raw)) {
    throw new Error("no percentage");
  }
});

Deno.test("asking party learns only not_met — never which item", () => {
  const body = publicGateBody(askingPartyNotMet());
  if (body.status !== "not_met") throw new Error("status");
  if ("missing" in body) throw new Error("asking party must not see missing[]");
});

Deno.test("gate shortfall is 409 not 403; terms_required shape unchanged", async () => {
  const gate = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
  if (!/status:\s*"shortfall"/.test(gate) && !/holderShortfall/.test(gate)) {
    throw new Error("gate must emit shortfall");
  }
  if (!/409/.test(gate)) throw new Error("shortfall HTTP is 409, not a 403 refusal");
  if (!/status:\s*"terms_required"/.test(gate)) {
    throw new Error("first-visit terms_required stays");
  }
  if (!/listMissingPlatformRequirements/.test(gate)) {
    throw new Error("missing platform requirements must shortfall the same way");
  }
});

Deno.test("VAI Go/VAI Access cap is three; VAI Pro uncapped — on write, not at the gate", async () => {
  let threw = false;
  try {
    assertAccessVaiRequirementCap(1, 4);
  } catch (e) {
    threw = e instanceof Error && e.message === "access_vai_requirement_cap";
  }
  if (!threw) throw new Error("VAI Go cap");
  threw = false;
  try {
    assertAccessVaiRequirementCap(2, 4);
  } catch (e) {
    threw = e instanceof Error && e.message === "access_vai_requirement_cap";
  }
  if (!threw) throw new Error("V.A.I. cap");
  assertAccessVaiRequirementCap(2, 3);
  assertAccessVaiRequirementCap(3, 12);
  const gate = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
  if (/access_vai_requirement_cap/.test(gate)) {
    throw new Error("cap is not a gate check");
  }
  const sql = await Deno.readTextFile(
    new URL(
      "../../../supabase/migrations/20260822130000_access_vai_requirement_cap.sql",
      import.meta.url
    )
  );
  if (!/access_vai_requirement_cap/.test(sql) || !/service_level/.test(sql)) {
    throw new Error("write-time cap must live in SQL");
  }
});

Deno.test("SN-19 page lists missing and transports; no percentage", async () => {
  const page = await Deno.readTextFile(
    new URL("../../../src/pages/VerifyShortfall.tsx", import.meta.url)
  );
  const app = await Deno.readTextFile(
    new URL("../../../src/App.tsx", import.meta.url)
  );
  if (!/\/verify\/shortfall/.test(app) || !/VerifyShortfall/.test(app)) {
    throw new Error("SN-19 must be routed");
  }
  if (!/Outstanding/.test(page) || !/Satisfy them now/.test(page)) {
    throw new Error("SN-19 is a list and a destination");
  }
  if (/kyc_match|%/.test(page)) throw new Error("SN-19 must not show a percentage");
});
