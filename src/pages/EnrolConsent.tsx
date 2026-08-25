import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnrolAlert,
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolSecondaryButton,
  EnrolShell,
  EnrolSkeleton,
  EnrolTitle,
  EnrolWarn,
  type EnrolUiState,
} from "@/components/enrol/EnrolShell";
import { getEnrolmentSessionId, invokeEnrol } from "@/lib/enrol";

export default function EnrolConsent() {
  const navigate = useNavigate();
  const sessionId = getEnrolmentSessionId();
  const [state, setState] = useState<EnrolUiState>("default");
  const [error, setError] = useState<string | null>(null);
  const [declined, setDeclined] = useState(false);

  async function consent() {
    if (!sessionId) {
      setError("session_id required");
      setState("error");
      return;
    }
    setState("loading");
    setError(null);
    try {
      await invokeEnrol("enrol-consent", {
        session_id: sessionId,
        consent_biometric: true,
        warning_acknowledged: true,
      });
      navigate("/enrol/pay");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setState("error");
    }
  }

  if (declined) {
    return (
      <EnrolShell stepLabel="Consent">
        <EnrolTitle>Nothing to consent to yet</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          You did not consent. No baseline was created and no credential will be issued.
        </p>
        <EnrolWarn>
          ⚠ Abandonment unruled: what a decline leaves behind is not in the record.
        </EnrolWarn>
        <EnrolSecondaryButton onClick={() => navigate("/enrol/keep")}>
          Back
        </EnrolSecondaryButton>
      </EnrolShell>
    );
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Recording consent">
        <EnrolSkeleton />
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        <p className="my-2 leading-[1.45]">Consent was not recorded. No baseline was created.</p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={consent}>Try again</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Consent">
      <EnrolTitle>Your face becomes your credential</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        You are consenting to a facial baseline being created and held at ChainPass, and to it being matched whenever a participating platform asks whether you are present.
      </p>
      <EnrolRow label="Held by" value="ChainPass" />
      <EnrolRow label="Shared with platforms" value="never" />
      <EnrolPrimaryButton onClick={consent}>I consent</EnrolPrimaryButton>
      <EnrolSecondaryButton onClick={() => setDeclined(true)}>
        I do not consent
      </EnrolSecondaryButton>
      <EnrolNote>§2.6. Consent is recorded and timestamped before any capture.</EnrolNote>
      <EnrolWarn>
        ⚠ Abandonment unruled: what a decline leaves behind is not in the record.
      </EnrolWarn>
    </EnrolShell>
  );
}
