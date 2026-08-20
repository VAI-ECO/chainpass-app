import { renewalPath } from "../_shared/renewal-path.ts";
Deno.test("both live → in_house", () => {
  if (renewalPath("2099-01-01", "2099-06-01", new Date("2026-08-21")) !== "in_house") {
    throw new Error("in_house");
  }
});
Deno.test("either lapsed → full_verification_required", () => {
  if (renewalPath("2020-01-01", "2099-01-01", new Date("2026-08-21")) !== "full_verification_required") {
    throw new Error("lapsed doc");
  }
  if (renewalPath("2099-01-01", "2020-01-01", new Date("2026-08-21")) !== "full_verification_required") {
    throw new Error("lapsed retention");
  }
});
