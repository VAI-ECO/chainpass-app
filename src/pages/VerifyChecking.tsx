import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  EnrolAlert,
  EnrolNote,
  EnrolPrimaryButton,
  EnrolShell,
  EnrolSkeleton,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";
import { getSettingNumber } from "@/lib/settings";

type LocState = {
  band?: string;
  status?: string;
  result?: string;
};

function routeForOutcome(data: LocState, navigate: ReturnType<typeof useNavigate>) {
  const band = typeof data.band === "string" ? data.band : "";
  const status = typeof data.status === "string" ? data.status : "";
  const result = typeof data.result === "string" ? data.result : "";

  if (status === "trial_approved" || result === "trial_approved") {
    navigate("/verify/trial", { replace: true, state: { status: "trial_approved" } });
    return true;
  }
  if (status === "rebaseline_required" || result === "rebaseline_required") {
    navigate("/verify/fourth-state", { replace: true });
    return true;
  }
  if (band === "green" || status === "granted" || result === "match") {
    navigate("/verify/green", { replace: true });
    return true;
  }
  if (band === "yellow" || band === "red") {
    navigate("/verify/band", { replace: true, state: { band } });
    return true;
  }
  if (status === "no_match" || result === "no_match") {
    navigate("/verify/band", { replace: true, state: { band: "red" } });
    return true;
  }
  return false;
}

/** SN-26 — poll until the band returns. Never a percentage. */
export default function VerifyChecking() {
  const navigate = useNavigate();
  const location = useLocation();
  const incoming = (location.state ?? {}) as LocState;
  const [error, setError] = useState<string | null>(null);
  const [pollSeconds, setPollSeconds] = useState<number | null>(null);

  useEffect(() => {
    getSettingNumber("handoff_poll_window")
      .then(setPollSeconds)
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    if (routeForOutcome(incoming, navigate)) return;
  }, [incoming, navigate]);

  // Async path: keep showing checking; re-check location state on poll cadence.
  useEffect(() => {
    if (pollSeconds == null || pollSeconds <= 0) return;
    if (routeForOutcome(incoming, navigate)) return;
    const id = window.setInterval(() => {
      // Parent gate flow pushes a fresh state on completion; until then stay here.
      if (routeForOutcome(incoming, navigate)) {
        window.clearInterval(id);
      }
    }, pollSeconds * 1000);
    return () => window.clearInterval(id);
  }, [pollSeconds, incoming, navigate]);

  if (error) {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Not verified</EnrolTitle>
        <EnrolAlert>{error}</EnrolAlert>
        <EnrolPrimaryButton onClick={() => navigate("/verify/call")}>
          Try again
        </EnrolPrimaryButton>
        <EnrolNote>Treat as not verified, never as not active.</EnrolNote>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Checking">
      <EnrolTitle>Checking…</EnrolTitle>
      <p className="my-2 leading-[1.45]">The capture is being matched at ChainPass.</p>
      <EnrolSkeleton />
      <EnrolNote>
        Reads the verification status until the band returns. §6. Never a percentage.
      </EnrolNote>
    </EnrolShell>
  );
}
