import { useState } from "react";
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

/** SN-20 — two-date test. POST renew-credential. */
export default function RenewCredential() {
  const navigate = useNavigate();
  const [state, setState] = useState<EnrolUiState>("default");
  const [error, setError] = useState<string | null>(null);
  const [vai, setVai] = useState("");

  async function renew() {
    if (!/^[A-Z0-9]{7}$/i.test(vai.trim())) {
      setError("vai required");
      setState("error");
      return;
    }
    setState("loading");
    setError(null);
    try {
      await invokeEnrol("renew-credential", { vai: vai.trim().toUpperCase() });
      setState("default");
      navigate("/enrol/complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setState("error");
    }
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Reading your term">
        <EnrolTitle>Renew your credential</EnrolTitle>
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          The renewal did not complete. Your existing term is unchanged and you have not
          been charged.
        </p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={renew}>Try again</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Renewal">
      <EnrolTitle>Renew your credential</EnrolTitle>
      <EnrolRow label="Term started" value="credential.term_start" />
      <EnrolRow label="Term ends" value="credential.expires" />
      <p className="my-2 leading-[1.45]">
        Both dates are held. Renewal carries the credential into a new term without
        reissuing the number.
      </p>
      <EnrolRow label="Price" value="settings:price_vai" />
      <EnrolRow label="Window" value="settings:renewal_window" />
      <input
        className="my-2 block w-full rounded-lg border-[1.5px] bg-white p-3"
        aria-label="V.A.I."
        placeholder="V.A.I."
        value={vai}
        onChange={(e) => setVai(e.target.value)}
      />
      <EnrolPrimaryButton onClick={renew}>Renew</EnrolPrimaryButton>
      <EnrolNote>§10.1 · §10.2 · §10.4. The number is fixed to you for life; only the term moves.</EnrolNote>
    </EnrolShell>
  );
}
