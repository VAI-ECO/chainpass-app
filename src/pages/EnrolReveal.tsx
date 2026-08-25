import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnrolAlert,
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolSkeleton,
  EnrolTitle,
  EnrolWarn,
  type EnrolUiState,
} from "@/components/enrol/EnrolShell";
import { getEnrolmentSessionId, invokeEnrol } from "@/lib/enrol";

export default function EnrolReveal() {
  const navigate = useNavigate();
  const sessionId = getEnrolmentSessionId();
  const [state, setState] = useState<EnrolUiState>("default");
  const [error, setError] = useState<string | null>(null);
  const [vai, setVai] = useState<string | null>(null);

  async function reveal() {
    if (!sessionId) {
      setError("session_id required");
      setState("error");
      return;
    }
    setState("loading");
    setError(null);
    try {
      const data = await invokeEnrol("enrol-reveal", {
        session_id: sessionId,
        provider_passed: true,
      });
      const issued = typeof data.vai === "string" ? data.vai.trim() : "";
      if (!issued) {
        setState("empty");
        return;
      }
      setVai(issued);
      setState("default");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setState("error");
    }
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Issuing your credential">
        <EnrolSkeleton />
      </EnrolShell>
    );
  }

  if (state === "empty") {
    return (
      <EnrolShell stepLabel="Step 7 of 13">
        <EnrolTitle>No credential issued</EnrolTitle>
        <p className="my-2 leading-[1.45]">Verification did not complete, so no V.A.I. exists.</p>
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          The credential could not be issued. Nothing was written and you have not been charged.
        </p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={reveal}>Try again</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  if (!vai) {
    return (
      <EnrolShell stepLabel="Step 7 of 13">
        <EnrolTitle>This is your V.A.I.</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          The identifier is issued only after the provider passes. It is live before any document is signed.
        </p>
        <EnrolPrimaryButton onClick={reveal}>Reveal V.A.I.</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Step 7 of 13">
      <EnrolTitle>This is your V.A.I.</EnrolTitle>
      <p
        className="my-3.5 text-center text-[34px] font-bold tracking-[0.14em]"
        data-wire="reads:credential.vai"
      >
        {vai}
      </p>
      <p className="my-2 leading-[1.45]">
        Seven characters. This is what a platform receives — not your name, not your document, not your face.
      </p>
      <EnrolRow label="Originated by" value="this platform" />
      <EnrolRow label="Term" value="settings:credential_year_length_years" />
      <EnrolPrimaryButton onClick={() => navigate("/enrol/accept")}>
        Continue
      </EnrolPrimaryButton>
      <EnrolNote>
        §2.8: origination is written at issue and locked by a database trigger, never by application code.
      </EnrolNote>
      <EnrolWarn>
        ⚠ Abandonment unruled. Step 7 onward is the dangerous half: a live V.A.I., unsigned documents, no baseline.
      </EnrolWarn>
    </EnrolShell>
  );
}
