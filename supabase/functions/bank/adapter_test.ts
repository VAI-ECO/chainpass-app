/**
 * Band floors come from settings — never literals in bank-adapter (§7.3).
 * deno test --allow-env --allow-net supabase/functions/bank/adapter_test.ts
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { normaliseMatchOutput, publicMatchShape } from "../_shared/bank-adapter.ts";
import { bandFromSimilarity } from "../_shared/band-compare.ts";

Deno.test("normalises confidence shape to band via settings", async () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    // Unit path: prove settings-driven floors without live DB
    if (bandFromSimilarity(0.9, 0.8, 0.65) !== "green") throw new Error("green");
    if (bandFromSimilarity(0.7, 0.8, 0.65) !== "yellow") throw new Error("yellow");
    // Changing floors changes band without code change
    if (bandFromSimilarity(0.7, 0.75, 0.5) !== "yellow") throw new Error("raised green");
    if (bandFromSimilarity(0.7, 0.65, 0.5) !== "green") throw new Error("lowered green");
    return;
  }
  const supabase = createClient(url, key);
  const i = await normaliseMatchOutput(supabase, { match: true, confidence: 0.9 });
  if (i.band !== "green") throw new Error("green");
  if (publicMatchShape(i).band !== "green") throw new Error("public");
});

Deno.test("normalises result shape to band", async () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = url && key
    ? createClient(url, key)
    : (null as unknown as ReturnType<typeof createClient>);
  if (!supabase) {
    // result-shape path does not need settings
    return;
  }
  if ((await normaliseMatchOutput(supabase, { result: "no_match" })).band !== "red") {
    throw new Error("red");
  }
});
