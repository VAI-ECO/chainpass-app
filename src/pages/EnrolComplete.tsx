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

export default function EnrolComplete() {
  const navigate = useNavigate();
  const sessionId = getEnrolmentSessionId();
  const [state, setState] = useState<EnrolUiState>("default");
  const [error, setError] = useState<string | null>(null);
  const [vai, setVai] = useState<string | null>(null);
  const [termYears, setTermYears] = useState<number | null>(null);

  async function finish() {
    if (!sessionId) {
      setError("session_id required");
      setState("error");
      return;
    }
    setState("loading");
    setError(null);
    try {
      const data = await invokeEnrol("enrol-complete", { session_id: sessionId });
      const issued = typeof data.vai === "string" ? data.vai.trim() : "";
      if (!issued) {
        setState("empty");
        return;
      }
      setVai(issued);
      setTermYears(typeof data.term_years === "number" ? data.term_years : null);
      setState("default");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setState("error");
    }
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Finishing">
        <EnrolSkeleton />
      </EnrolShell>
    );
  }

  if (state === "empty") {
    return (
      <EnrolShell stepLabel="Step 11 of 13">
        <EnrolTitle>Nothing to confirm</EnrolTitle>
        <p className="my-2 leading-[1.45]">No credential was issued in this session.</p>
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          Your credential exists but this page could not load it. Return to the platform and you will be admitted.
        </p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={() => navigate("/enrol/security")}>Return</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  if (!vai) {
    return (
      <EnrolShell stepLabel="Step 11 of 13">
        <EnrolTitle>You are verified</EnrolTitle>
        <EnrolPrimaryButton onClick={finish}>Confirm</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Step 11 of 13">
      <EnrolTitle>You are verified</EnrolTitle>
      <p className="my-3.5 text-center text-[34px] font-bold tracking-[0.14em]">{vai}</p>
      <EnrolRow
        label="Valid until"
        value={
          termYears == null
            ? "settings:credential_year_length_years"
            : `settings:credential_year_length_years (${termYears})`
        }
      />
      <EnrolRow
        label="Works on"
        value="every participating platform at this level or below"
      />
      <p className="my-2 leading-[1.45]">
        Keep your V.A.I. You will not be asked for a document again.
      </p>
      <EnrolPrimaryButton onClick={() => navigate("/enrol/security")}>
        Continue
      </EnrolPrimaryButton>
      <EnrolNote>§10: one term, renewable. The term length is a setting.</EnrolNote>
    </EnrolShell>
  );
}
