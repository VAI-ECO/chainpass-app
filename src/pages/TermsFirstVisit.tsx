import { useState } from "react";
import {
  EnrolAlert,
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
  type EnrolUiState,
} from "@/components/enrol/EnrolShell";
import { invokeEnrol } from "@/lib/enrol";

/** SN-22 — first-visit terms. ChainPass holds the document. §14.3. */
export default function TermsFirstVisit() {
  const [state, setState] = useState<EnrolUiState>("default");
  const [error, setError] = useState<string | null>(null);
  const [vai, setVai] = useState("");
  const [capture, setCapture] = useState("");
  const [termsVersionId, setTermsVersionId] = useState("");
  const [bodyText, setBodyText] = useState("");

  async function sign() {
    if (!termsVersionId) {
      setError("terms_version_id required");
      setState("error");
      return;
    }
    setState("loading");
    setError(null);
    try {
      await invokeEnrol("gate-sign", {
        vai: vai.trim().toUpperCase(),
        capture,
        terms_version_id: termsVersionId,
        required_level: 1,
      });
      setState("empty");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setState("error");
    }
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Loading the current version">
        <EnrolTitle>This platform&apos;s terms</EnrolTitle>
      </EnrolShell>
    );
  }

  if (state === "empty") {
    return (
      <EnrolShell stepLabel="First visit">
        <EnrolTitle>Signed</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          The proof is face-bound, versioned, and pullable forever.
        </p>
        <EnrolNote>§14.3 item 3.</EnrolNote>
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          The terms could not be loaded. Nothing was signed and you have not been admitted.
        </p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={() => setState("default")}>Try again</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="First visit">
      <EnrolTitle>This platform&apos;s terms</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        Every platform supplies its own terms. You sign them once, bound to your face.
        ChainPass holds the document itself, immutable and versioned — not a pointer.
      </p>
      <EnrolRow label="Version" value="current agreement_versions row" />
      <textarea
        className="my-2 min-h-[8rem] w-full rounded-lg border-[1.5px] bg-white p-3"
        aria-label="Terms text — the document itself, held at ChainPass"
        value={bodyText}
        onChange={(e) => setBodyText(e.target.value)}
        placeholder="The document itself, held at ChainPass"
      />
      <input
        className="my-2 block w-full rounded-lg border-[1.5px] bg-white p-3"
        aria-label="terms_version_id"
        placeholder="terms_version_id"
        value={termsVersionId}
        onChange={(e) => setTermsVersionId(e.target.value)}
      />
      <input
        className="my-2 block w-full rounded-lg border-[1.5px] bg-white p-3"
        aria-label="V.A.I."
        placeholder="V.A.I."
        value={vai}
        onChange={(e) => setVai(e.target.value)}
      />
      <input
        className="my-2 block w-full rounded-lg border-[1.5px] bg-white p-3"
        aria-label="capture"
        placeholder="capture"
        value={capture}
        onChange={(e) => setCapture(e.target.value)}
      />
      <EnrolPrimaryButton onClick={sign}>I agree to this version</EnrolPrimaryButton>
      <EnrolNote>
        §14.3 · §14.2: originating platform accepts at enrolment step 8; any other platform
        on first visit. POST gate-sign with terms_version_id.
      </EnrolNote>
    </EnrolShell>
  );
}
