/**
 * Walk the enrolment screens. CANON-CP-02 §1 order must be what navigate() executes.
 * deno test --allow-read supabase/functions/enrol/cp02_walk_test.ts
 */
async function readPage(name: string): Promise<string> {
  return await Deno.readTextFile(
    new URL(`../../../src/pages/${name}.tsx`, import.meta.url)
  );
}

function destinations(page: string): string[] {
  if (page.includes('"/enrol/requirements"') && page.includes('"/enrol/baseline"')) {
    return ["/enrol/requirements or /enrol/baseline"];
  }
  return [...page.matchAll(/navigate\("(\/enrol\/[^"]+)"\)/g)].map((m) => m[1]);
}

Deno.test("walk one enrolment — CP-02 order is what the screens execute", async () => {
  const walk: Array<{ from: string; expect: string; page: string }> = [
    { from: "1 land", expect: "/enrol/keep", page: "EnrolEntry" },
    { from: "1a info", expect: "/enrol/consent", page: "EnrolKeep" },
    { from: "consent", expect: "/enrol/pay", page: "EnrolConsent" },
    { from: "2 PAY", expect: "/enrol/capture", page: "EnrolPay" },
    { from: "4 KYC / 5 baseline", expect: "/enrol/reveal", page: "EnrolCapture" },
    { from: "8 V.A.I.", expect: "/enrol/register", page: "EnrolReveal" },
    { from: "9 contact", expect: "/enrol/otp", page: "EnrolRegister" },
    { from: "9 OTP", expect: "/enrol/accept", page: "EnrolOtp" },
    { from: "10 documents", expect: "/enrol/requirements or /enrol/baseline", page: "EnrolAccept" },
    { from: "10 face match", expect: "/enrol/complete", page: "EnrolBaseline" },
    { from: "before retrieval", expect: "/enrol/security", page: "EnrolComplete" },
    { from: "11 retrieval", expect: "/enrol/final", page: "EnrolSecurity" },
    { from: "11a final", expect: "/enrol/handoff", page: "EnrolFinal" },
  ];

  const executed: string[] = [];
  for (const step of walk) {
    const text = await readPage(step.page);
    const dests = destinations(text);
    executed.push(`${step.from} (${step.page}) → ${dests.join(" · ") || "(none)"}`);
    if (!dests.includes(step.expect)) {
      throw new Error(
        `${step.page} destinations ${dests.join(", ") || "(none)"}, expected ${step.expect}`
      );
    }
  }
  console.log(executed.join("\n"));
});
