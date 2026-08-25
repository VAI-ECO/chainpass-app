/**
 * Item 3: visit miss → terms_required; outcomeFromBand never leaks a percentage.
 * deno test --allow-env supabase/functions/gate/visits_test.ts
 */
import { outcomeFromBand } from "../_shared/gate-visits.ts";

Deno.test("green and yellow grant; red is no_match", () => {
  if (outcomeFromBand("green") !== "granted") throw new Error("green");
  if (outcomeFromBand("yellow") !== "granted") throw new Error("yellow");
  if (outcomeFromBand("red") !== "no_match") throw new Error("red");
});

Deno.test("first-visit miss stays terms_required — not a shortfall rename", async () => {
  const gate = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
  if (!/status:\s*"terms_required"/.test(gate)) {
    throw new Error("first visit without platform_visits stays terms_required");
  }
  if (!/findPlatformVisit/.test(gate)) {
    throw new Error("visit miss must still be checked");
  }
});

Deno.test("outcome values never look like percentages", () => {
  for (const b of ["green", "yellow", "red"] as const) {
    const s = outcomeFromBand(b);
    if (/%/.test(s) || /\d/.test(s)) throw new Error(`numeric leak: ${s}`);
  }
});
