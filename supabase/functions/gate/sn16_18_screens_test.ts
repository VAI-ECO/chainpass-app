/**
 * SN-16 last attempt · SN-17 re-baseline · SN-18 not active.
 * deno test --allow-read supabase/functions/gate/sn16_18_screens_test.ts
 */
async function read(rel: string): Promise<string> {
  return await Deno.readTextFile(new URL(rel, import.meta.url));
}

Deno.test("SN-16 last attempt reads attempt_count and engine_attempt_last; no constant N", async () => {
  const page = await read("../../../src/pages/VerifyLastAttempt.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/verify\/last-attempt/.test(app)) throw new Error("SN-16 route missing");
  if (!/This is your last attempt/.test(page)) throw new Error("SN-16 title");
  if (!/settings:attempt_count/.test(page)) throw new Error("attempt count is a setting pointer");
  if (!/settings:engine_attempt_last/.test(page)) {
    throw new Error("last attempt engine is a setting pointer");
  }
  if (/\b3 of 3\b/.test(page) && !/settings:attempt_count/.test(page)) {
    throw new Error("N must not be a constant");
  }
  if (/>premium</.test(page) || /value="premium"/.test(page)) {
    throw new Error("premium must not be a constant label");
  }
});

Deno.test("SN-17 re-baseline is fourth state at ChainPass cost; reds_threshold is a setting", async () => {
  const page = await read("../../../src/pages/VerifyRebaseline.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/verify\/rebaseline/.test(app)) throw new Error("SN-17 route missing");
  if (!/We need a fresh baseline/.test(page)) throw new Error("SN-17 title");
  if (!/settings:reds_threshold/.test(page)) throw new Error("reds threshold is a setting");
  if (!/none/.test(page) || !/ChainPass/.test(page)) {
    throw new Error("fresh verification is at ChainPass cost");
  }
  if (/suspended|banned|expired/.test(page)) {
    throw new Error("SN-17 must not name why the credential failed");
  }
});

Deno.test("SN-18 not active is one word, never why", async () => {
  const page = await read("../../../src/pages/VerifyNotActive.tsx");
  const app = await read("../../../src/App.tsx");
  if (!/\/verify\/not-active/.test(app)) throw new Error("SN-18 route missing");
  if (!/<EnrolTitle>Not active<\/EnrolTitle>/.test(page) && !/>Not active</.test(page)) {
    throw new Error("SN-18 title is Not active");
  }
  if (/suspended|banned|expired|lapsed/.test(page) && !/never why/.test(page)) {
    throw new Error("must not disclose which inactive state");
  }
  if (/invokeEnrol|functions\.invoke/.test(page) && /reason/.test(page)) {
    throw new Error("SN-18 writes none and never a reason");
  }
});
