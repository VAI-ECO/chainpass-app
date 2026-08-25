/**
 * SN-86 trial viewer — CANON-CP-04 §4.
 * deno test --allow-read supabase/functions/gate/sn86_trial_viewer_test.ts
 */
async function read(rel: string): Promise<string> {
  return await Deno.readTextFile(new URL(rel, import.meta.url));
}

Deno.test("SN-86 is a separate route from SN-25–32", async () => {
  const app = await read("../../../src/App.tsx");
  if (!/\/verify\/trial/.test(app)) throw new Error("trial route missing");
  if (!/VerifyTrial/.test(app)) throw new Error("VerifyTrial not mounted");
});

Deno.test("SN-86 banner is standing, never dismissible, never a toast", async () => {
  const page = await read("../../../src/pages/VerifyTrial.tsx");
  const shell = await read("../../../src/components/enrol/EnrolShell.tsx");
  if (!/TrialShell/.test(page)) throw new Error("trial chrome");
  if (!/TRIAL — NOT VERIFIED/.test(shell)) throw new Error("banner copy");
  if (/dismiss|toast|below the fold/i.test(shell)) {
    throw new Error("banner must not be dismissible or a toast");
  }
  if (!/sticky/.test(shell)) throw new Error("banner must stay at the top");
});

Deno.test("SN-86 result is trial_approved — never match, green, or pass", async () => {
  const page = await read("../../../src/pages/VerifyTrial.tsx");
  if (!/trial_approved/.test(page)) throw new Error("trial_approved");
  if (!/Nothing was checked/.test(page)) throw new Error("plain copy");
  if (!/value="trial_approved"/.test(page)) throw new Error("result row");
  if (/\bGREEN\b/.test(page)) throw new Error("must not present GREEN");
  if (/%/.test(page) || /confidence/i.test(page)) {
    throw new Error("no band, number, or confidence");
  }
});

Deno.test("everyday viewer routes trial_approved to SN-86", async () => {
  const call = await read("../../../src/pages/VerifyCall.tsx");
  const checking = await read("../../../src/pages/VerifyChecking.tsx");
  if (!/trial_approved/.test(call) || !/\/verify\/trial/.test(call)) {
    throw new Error("VerifyCall must hand trial_approved to SN-86");
  }
  if (!/trial_approved/.test(checking) || !/\/verify\/trial/.test(checking)) {
    throw new Error("VerifyChecking must hand trial_approved to SN-86");
  }
});
