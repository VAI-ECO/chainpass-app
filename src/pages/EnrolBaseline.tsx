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
  type EnrolUiState,
} from "@/components/enrol/EnrolShell";
import { getEnrolmentSessionId, invokeEnrol } from "@/lib/enrol";

export default function EnrolBaseline() {
  const navigate = useNavigate();
  const sessionId = getEnrolmentSessionId();
  const [state, setState] = useState<EnrolUiState>("default");
  const [error, setError] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);

  async function commit() {
    if (!sessionId) {
      setError("session_id required");
      setState("error");
      return;
    }
    setState("loading");
    setError(null);
    try {
      await invokeEnrol("enrol-baseline", {
        session_id: sessionId,
        documents_signed: true,
      });
      setCommitted(true);
      setState("default");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setState("error");
    }
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Committing the baseline">
        <EnrolSkeleton />
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          The baseline was not committed. Your session is held and can be resumed.
        </p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={commit}>Resume</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  if (!committed) {
    return (
      <EnrolShell stepLabel="Step 9 of 11">
        <EnrolTitle>Your baseline is committed</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          Your facial baseline is held at ChainPass after the documents are signed. The platform never receives, stores or matches the biometric.
        </p>
        <EnrolPrimaryButton onClick={commit}>Commit baseline</EnrolPrimaryButton>
        <EnrolNote>
          §2.7. The held frame is committed here. FACE_SERVICE must be configured — there is no stub matcher.
        </EnrolNote>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Step 9 of 11">
      <EnrolTitle>Your baseline is committed</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        Your facial baseline is now held at ChainPass. Every future check anywhere in the ecosystem is matched against this one baseline.
      </p>
      <EnrolRow label="Held at" value="ChainPass" />
      <EnrolRow label="Sent to the platform" value="never" />
      <EnrolPrimaryButton onClick={() => navigate("/enrol/complete")}>
        Continue
      </EnrolPrimaryButton>
      <EnrolNote>
        §2.7. Every face check in the ecosystem runs at ChainPass, so the credential means the same thing on every platform.
      </EnrolNote>
    </EnrolShell>
  );
}
