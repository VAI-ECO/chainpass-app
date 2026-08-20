import { renewalPath } from "../_shared/renewal-path.ts";

Deno.test("renewalPath: both live → in_house; either lapsed → full_verification_required; client id unused", () => {
  const credential = {
    complycube_client_id: null as string | null,
    document_expiry: "2099-01-01",
    next_complycube_date: "2099-06-01",
  };
  if (credential.complycube_client_id !== null) {
    throw new Error("fixture must keep client id null");
  }

  const now = new Date("2026-08-20T00:00:00Z");

  if (renewalPath(credential.document_expiry, credential.next_complycube_date, now) !== "in_house") {
    throw new Error("expected in_house when both dates live");
  }

  if (renewalPath("2020-01-01", "2099-06-01", now) !== "full_verification_required") {
    throw new Error("expected full_verification_required when document_expiry lapsed");
  }

  if (renewalPath("2099-01-01", "2020-01-01", now) !== "full_verification_required") {
    throw new Error("expected full_verification_required when provider retention lapsed");
  }

  if (renewalPath(null, "2099-06-01", now) !== "full_verification_required") {
    throw new Error("expected full_verification_required when document_expiry null");
  }

  console.log("RENEW_TEST_OK nulled_client_id=true branches=in_house,full_verification_required");
});
