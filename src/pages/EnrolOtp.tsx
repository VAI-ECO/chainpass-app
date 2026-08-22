import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnrolAlert,
  EnrolField,
  EnrolNote,
  EnrolPrimaryButton,
  EnrolSecondaryButton,
  EnrolShell,
  EnrolSkeleton,
  EnrolTitle,
  EnrolWarn,
  type EnrolUiState,
} from "@/components/enrol/EnrolShell";
import { getEnrolmentSessionId, invokeEnrol } from "@/lib/enrol";

export default function EnrolOtp() {
  const navigate = useNavigate();
  const sessionId = getEnrolmentSessionId();
  const [state, setState] = useState<EnrolUiState>("default");
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");

  async function confirm() {
    if (!sessionId) {
      setError("session_id required");
      setState("error");
      return;
    }
    setState("loading");
    setError(null);
    try {
      await invokeEnrol("enrol-otp", {
        session_id: sessionId,
        otp_code: code,
      });
      navigate("/enrol/capture");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setState("error");
    }
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Sending the code">
        <EnrolSkeleton />
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          That code was not accepted. Nothing has been sent to the platform.
        </p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={confirm}>Try again</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Step 5 of 11">
      <EnrolTitle>Confirm your contact</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        A code has been sent to the address you gave. Enter it to continue.
      </p>
      <EnrolField
        type="text"
        placeholder="Code"
        aria-label="Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        inputMode="numeric"
        autoComplete="one-time-code"
      />
      <EnrolPrimaryButton onClick={confirm}>Confirm</EnrolPrimaryButton>
      <EnrolSecondaryButton disabled>
        Send it again
      </EnrolSecondaryButton>
      <EnrolWarn>
        ⚠ Code length and expiry unruled. Drawn as a field without a fixed digit count. Resend endpoint is not in the wire — not invented.
      </EnrolWarn>
      <EnrolNote>Control is proven here, before any provider is paid.</EnrolNote>
    </EnrolShell>
  );
}
