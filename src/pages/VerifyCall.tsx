import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { getRememberedVai } from "@/lib/remember-vai";
import { getSettingNumber } from "@/lib/settings";

/** SN-25 — operational call. POST gate (or verify). */
export default function VerifyCall() {
  const navigate = useNavigate();
  const [state, setState] = useState<EnrolUiState>("default");
  const [error, setError] = useState<string | null>(null);
  const [vai, setVai] = useState(() => getRememberedVai() ?? "");
  const [capture, setCapture] = useState("");
  const [attemptMax, setAttemptMax] = useState("settings:attempt_count_n");

  useEffect(() => {
    getSettingNumber("attempt_count_n")
      .then((n) => setAttemptMax(n == null ? "settings:attempt_count_n" : String(n)))
      .catch(() => setAttemptMax("settings:attempt_count_n"));
  }, []);

  async function captureNow() {
    setState("loading");
    setError(null);
    navigate("/verify/checking");
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
      const band = typeof data.band === "string" ? data.band : "";
      const status = typeof data.status === "string" ? data.status : "";
      if (status === "trial_approved") {
        navigate("/verify/trial", {
          replace: true,
          state: { status: "trial_approved", vai: vai.trim().toUpperCase(), capture },
        });
      } else if (status === "rebaseline_required") {
        navigate("/verify/fourth-state", { replace: true });
      } else if (band === "green" || status === "granted") {
        navigate("/verify/green", { replace: true });
      } else if (band === "yellow" || band === "red" || status === "no_match") {
        navigate("/verify/band", {
          replace: true,
          state: { band: band || "red" },
        });
      } else {
        navigate("/verify/checking", { replace: true, state: data });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setState("error");
    }
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={() => setState("default")}>Try again</EnrolPrimaryButton>
        <EnrolNote>This attempt has not been counted.</EnrolNote>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Verification">
      <EnrolTitle>Look at the camera</EnrolTitle>
      <EnrolRow label="Attempt max" value={attemptMax} />
      <EnrolRow label="Attempt dial" value="settings:attempt_count" />
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
      <EnrolNote>
        §6: the capture goes to ChainPass and is matched against the baseline held there.
        A remembered V.A.I. fills the number field. The face still runs.
      </EnrolNote>
    </EnrolShell>
  );
}
