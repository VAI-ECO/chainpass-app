/**
 * §10.3 provider retention is its own column. renewal-path reads it, not the term.
 * deno test --allow-read --allow-env supabase/functions/enrol/kyc_retention_test.ts
 */
import { renewalPath } from "../_shared/renewal-path.ts";

Deno.test("§10.3 column exists as next_complycube_date — separate from expiry and the term", async () => {
  const core = await Deno.readTextFile(
    new URL("../../migrations/20260811000001_chainpass_core.sql", import.meta.url)
  );
  const schema = await Deno.readTextFile(
    new URL("../../../docs/chainpass-schema.sql", import.meta.url)
  );
  if (!/next_complycube_date/.test(core) || !/next_complycube_date/.test(schema)) {
    throw new Error("provider retention column next_complycube_date is absent");
  }
  if (!/document_expiry/.test(core)) {
    throw new Error("document_expiry must remain its own column");
  }
  const path = await Deno.readTextFile(
    new URL("../_shared/renewal-path.ts", import.meta.url)
  );
  if (!/document_expiry = canon document_expires_at/.test(path)) {
    throw new Error("first date is document expiry");
  }
  if (!/next_complycube_date = provider retention/.test(path)) {
    throw new Error("second date is provider retention — §10.3");
  }
  if (/year_starts_at|year_ends_at/.test(path)) {
    throw new Error("retention must not be the credential term");
  }
});

Deno.test("renewal-path reads expiry then retention — not one date for both", () => {
  const now = new Date("2026-08-23T00:00:00Z");
  if (renewalPath("2099-01-01", "2099-06-01", now) !== "in_house") {
    throw new Error("both live");
  }
  if (renewalPath("2020-01-01", "2099-06-01", now) !== "full_verification_required") {
    throw new Error("lapsed document_expiry must force full verification");
  }
  if (renewalPath("2099-01-01", "2020-01-01", now) !== "full_verification_required") {
    throw new Error("lapsed next_complycube_date must force full verification");
  }
  if (renewalPath("2099-01-01", null, now) !== "full_verification_required") {
    throw new Error("null retention is not live");
  }
});

Deno.test("live mint writes next_complycube_date from settings, not a constant", async () => {
  const reveal = await Deno.readTextFile(
    new URL("../enrol-reveal/index.ts", import.meta.url)
  );
  if (!/next_complycube_date/.test(reveal)) {
    throw new Error("reveal must write the retention column at mint");
  }
  if (!/provider_retention_years/.test(reveal)) {
    throw new Error("retention window is settings.provider_retention_years — the provider's window, not a code constant");
  }
  if (/\b3 years\b|\binterval '3 years'/.test(reveal)) {
    throw new Error("do not restore the superseded three-year constant");
  }
});
