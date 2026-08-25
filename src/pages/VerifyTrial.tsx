import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  EnrolAlert,
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolSkeleton,
  EnrolTitle,
  TrialShell,
  type EnrolUiState,
} from "@/components/enrol/EnrolShell";
import { invokeEnrol } from "@/lib/enrol";
import { getRememberedVai } from "@/lib/remember-vai";

type LocState = {
  vai?: string;
  capture?: string;
  status?: string;
};

/**
 * SN-86 — trial viewer. Same flow as SN-25–32, different chrome.
 * Result is trial_approved. Never match, never green, never pass. CANON-CP-04 §4.
 */
export default function VerifyTrial() {
  const navigate = useNavigate();
  const incoming = (useLocation().state ?? {}) as LocState;
  const [phase, setPhase] = useState<"call" | "checking" | "approved">(
    incoming.status === "trial_approved" ? "approved" : "call"
  );
  const [state, setState] = useState<EnrolUiState>("default");
  const [error, setError] = useState<string | null>(null);
  const [vai, setVai] = useState(
    () => incoming.vai ?? getRememberedVai() ?? ""
  );
  const [capture, setCapture] = useState(incoming.capture ?? "");

  useEffect(() => {
    if (incoming.status === "trial_approved") setPhase("approved");
  }, [incoming.status]);

  async function captureNow() {
    setState("loading");
    setError(null);
    setPhase("checking");
    try {
      let data: Record<string, unknown>;
      try {
        data = await invokeEnrol("gate", {
          vai: vai.trim().toUpperCase(),
          capture,
          required_level: 2,
        });
      } catch {
        data = await invokeEnrol("verify", {
          vai: vai.trim().toUpperCase(),
          capture,
          required_level: 2,
        });
      }
      const status = typeof data.status === "string" ? data.status : "";
      if (status === "trial_approved") {
        setPhase("approved");
        setState("default");
        return;
      }
      if (status === "enroll_required") {
        setError("enrolment is required first");
        setPhase("call");
        setState("error");
        return;
      }
      setError("trial_approved was not returned");
      setPhase("call");
      setState("error");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setPhase("call");
      setState("error");
    }
  }

  if (state === "error") {
    return (
      <TrialShell stepLabel="Trial">
        <EnrolTitle>Not a verification</EnrolTitle>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={() => setState("default")}>Try again</EnrolPrimaryButton>
        <EnrolNote>Nothing was checked. This is not a verification.</EnrolNote>
      </TrialShell>
    );
  }

  if (phase === "checking") {
    return (
      <TrialShell stepLabel="Trial">
        <EnrolTitle>Checking…</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          The photo is being compared to itself at ChainPass. Nothing behind it is
          an identity.
        </p>
        <EnrolSkeleton />
        <EnrolNote>Nothing was checked. This is not a verification.</EnrolNote>
      </TrialShell>
    );
  }

  if (phase === "approved") {
    const photo = capture.startsWith("data:") || capture.startsWith("http")
      ? capture
      : null;
    return (
      <TrialShell stepLabel="Trial">
        <EnrolTitle>Approved — not verified</EnrolTitle>
        {photo ? (
          <img
            src={photo}
            alt="Trial photo"
            className="my-2 w-full rounded-lg"
          />
        ) : (
          <EnrolRow label="Trial photo" value="held at ChainPass" />
        )}
        <EnrolRow label="V.A.I." value={vai.trim().toUpperCase() || "—"} />
        <EnrolRow label="Result" value="trial_approved" />
        <p className="my-2 leading-[1.45]">
          Nothing was checked. No document, no provider, no background check.
          This is not a verification.
        </p>
        <EnrolPrimaryButton onClick={() => navigate("/verify/trial")}>
          Done
        </EnrolPrimaryButton>
        <EnrolNote>
          The result is trial_approved. It is not a match, not a band, and not a
          pass. CANON-CP-04 §2 · §4.
        </EnrolNote>
      </TrialShell>
    );
  }

  return (
    <TrialShell stepLabel="Trial">
      <EnrolTitle>Look at the camera</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        Same steps as a real check. The result cannot be treated as a verification.
      </p>
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
      <EnrolPrimaryButton onClick={captureNow} disabled={!capture.trim()}>
        Capture
      </EnrolPrimaryButton>
      <EnrolNote>Nothing was checked. This is not a verification.</EnrolNote>
    </TrialShell>
  );
}
