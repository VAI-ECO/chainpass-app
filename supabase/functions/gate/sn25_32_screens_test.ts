/**
 * SN-25–32 viewer set.
 * deno test --allow-read supabase/functions/gate/sn25_32_screens_test.ts
 */
async function read(rel: string): Promise<string> {
  return await Deno.readTextFile(new URL(rel, import.meta.url));
}

Deno.test("SN-25 operational call reads attempt_count; writes verify", async () => {
  const page = await read("../../../src/pages/VerifyCall.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/verify\/call/.test(app)) throw new Error("route");
  if (!/Look at the camera/.test(page)) throw new Error("title");
  if (!/settings:attempt_count/.test(page)) throw new Error("attempt_count pointer");
  if (!/"verify"/.test(page) && !/invokeEnrol\("verify"/.test(page)) {
    throw new Error("POST verify");
  }
});

Deno.test("SN-26 checking polls until a band, never a percentage", async () => {
  const page = await read("../../../src/pages/VerifyChecking.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/verify\/checking/.test(app)) throw new Error("route");
  if (!/Checking/.test(page)) throw new Error("title");
  if (/%/.test(page) || /kyc_match/.test(page)) throw new Error("no percentage");
});

Deno.test("SN-27 green is a band only", async () => {
  const page = await read("../../../src/pages/VerifyGreen.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/verify\/green/.test(app)) throw new Error("route");
  if (!/GREEN/.test(page) || !/Verified/.test(page)) throw new Error("green band");
  if (/%/.test(page)) throw new Error("no percentage");
});

Deno.test("SN-28 yellow and red both rendered; last attempt routes SN-16", async () => {
  const page = await read("../../../src/pages/VerifyBand.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/verify\/band/.test(app)) throw new Error("route");
  if (!/YELLOW/.test(page) || !/RED/.test(page)) throw new Error("both outcomes");
  if (!/last-attempt/.test(page)) throw new Error("last attempt → SN-16");
  if (/%/.test(page)) throw new Error("no percentage");
});

Deno.test("SN-29 fourth state uses reds_threshold; cost none", async () => {
  const page = await read("../../../src/pages/VerifyFourthState.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/verify\/fourth-state/.test(app)) throw new Error("route");
  if (!/settings:reds_threshold/.test(page)) throw new Error("threshold setting");
  if (!/rebaseline/.test(page)) throw new Error("nav to CP17");
});

Deno.test("SN-30 failures column is a queue, not a score", async () => {
  const page = await read("../../../src/pages/ReviewFailures.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/review\/failures/.test(app)) throw new Error("route");
  if (!/side-by-side/.test(page)) throw new Error("row opens SN-31");
  if (/%/.test(page)) throw new Error("no percentage");
});

Deno.test("SN-31 side-by-side review outcome is flagged unruled", async () => {
  const page = await read("../../../src/pages/ReviewSideBySide.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/review\/side-by-side/.test(app)) throw new Error("route");
  if (!/UNRULED|unruled/.test(page)) throw new Error("reviewer outcome unruled");
});

Deno.test("SN-32 supplier obligations read declared health; image serve separate", async () => {
  const page = await read("../../../src/pages/SupplierObligations.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/supplier\/obligations/.test(app)) throw new Error("route");
  if (!/declared/.test(page) || !/separate/.test(page)) {
    throw new Error("health declared; image serve separate");
  }
  if (!/health/.test(page)) throw new Error("reads health");
});
