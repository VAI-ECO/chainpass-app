/**
 * SN-20 renewal · SN-21 cross-platform · SN-22 first-visit terms · SN-23 rows · SN-24 unruled.
 * deno test --allow-read supabase/functions/gate/sn20_24_screens_test.ts
 */
async function read(rel: string): Promise<string> {
  return await Deno.readTextFile(new URL(rel, import.meta.url));
}

Deno.test("SN-20 renewal is the two-date test; prices are settings pointers", async () => {
  const page = await read("../../../src/pages/RenewCredential.tsx");
  const app = await read("../../../src/App.tsx");
  const renew = await read("../renew-credential/index.ts");
  if (!/path="\/renew"/.test(app)) throw new Error("SN-20 route");
  if (!/renew-credential/.test(page) && !/Renew/.test(page)) {
    throw new Error("SN-20 must renew");
  }
  if (!/settings:price_vai/.test(page) || !/settings:renewal_window/.test(page)) {
    throw new Error("prices and window are settings");
  }
  if (!/renewalPath/.test(renew) && !/two.date|document_expiry/.test(renew)) {
    throw new Error("renew-credential must run the two-date test");
  }
});

Deno.test("SN-21 cross-platform: on file vs needed here; no charge", async () => {
  const page = await read("../../../src/pages/VerifyCrossPlatform.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/verify\/cross-platform/.test(app)) throw new Error("SN-21 route");
  if (!/Needed here|on file/.test(page)) throw new Error("compare on-file vs needed");
  if (!/none/.test(page)) throw new Error("no charge to the member");
  if (/\b29\b|\b99\b/.test(page)) throw new Error("no price literals");
});

Deno.test("SN-22 first-visit terms hold the document; cite §14.3 not register", async () => {
  const page = await read("../../../src/pages/TermsFirstVisit.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/terms\/first-visit/.test(app)) throw new Error("SN-22 route");
  if (!/gate-sign/.test(page) && !/terms_version_id/.test(page)) {
    throw new Error("first visit signs through gate-sign / version id");
  }
  if (/we hold a reference|never the content/.test(page)) {
    throw new Error("stale §14.2 copy — ChainPass holds the document");
  }
  if (!/§14\.3/.test(page)) throw new Error("cite acceptance-era §14.3");
});

Deno.test("SN-23 rows and thresholds are settings pointers; no constants", async () => {
  const page = await read("../../../src/pages/AdminRows.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/admin\/rows/.test(app)) throw new Error("SN-23 route");
  if (!/settings:band_green/.test(page) || !/settings:attempt_count/.test(page)) {
    throw new Error("band and attempt count are pointers");
  }
  if (!/settings:price_vai/.test(page)) throw new Error("prices are pointers");
  if (/\b0\.80\b|\b0\.65\b/.test(page)) throw new Error("no band literals");
});

Deno.test("SN-24 unruled plate flags, does not invent", async () => {
  const page = await read("../../../src/pages/UnruledPlate.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/unruled/.test(app)) throw new Error("SN-24 flag-plate route");
  if (!/Flagged, not drawn/.test(page)) throw new Error("SN-24 title");
  if (!/Dashboard authentication/.test(page)) throw new Error("must list unruled items");
});
