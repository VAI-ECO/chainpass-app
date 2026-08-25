import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnrolAlert,
  EnrolField,
  EnrolNote,
  EnrolPrimaryButton,
  EnrolShell,
  EnrolSkeleton,
  EnrolTitle,
  type EnrolUiState,
} from "@/components/enrol/EnrolShell";
import { getEnrolmentSessionId, invokeEnrol } from "@/lib/enrol";

export default function EnrolRegister() {
  const navigate = useNavigate();
  const sessionId = getEnrolmentSessionId();
  const [state, setState] = useState<EnrolUiState>("default");
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contact, setContact] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [askUsername, setAskUsername] = useState(false);
  const [askEmail, setAskEmail] = useState(false);
  const [askPhone, setAskPhone] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    invokeEnrol("enrol-register", { session_id: sessionId, action: "spec" })
      .then((data) => {
        const required = Array.isArray(data.required) ? data.required : [];
        setAskUsername(required.includes("username"));
        setAskEmail(required.includes("email"));
        setAskPhone(required.includes("phone"));
      })
      .catch(() => {
        setAskUsername(false);
        setAskEmail(false);
        setAskPhone(false);
      });
  }, [sessionId]);

  const bothContactRequired = askEmail && askPhone;
  const floorContact = !askEmail && !askPhone;

  function splitContact(raw: string): { email?: string; phone?: string } {
    const v = raw.trim();
    if (!v) return {};
    if (v.includes("@")) return { email: v };
    return { phone: v };
  }

  async function submit() {
    if (!sessionId) {
      setError("session_id required");
      setState("error");
      return;
    }
    setState("loading");
    setError(null);
    try {
      const fromFloor = floorContact ? splitContact(contact) : {};
      await invokeEnrol("enrol-register", {
        session_id: sessionId,
        terms_accepted: termsAccepted,
        ...(askUsername && username ? { username } : {}),
        ...(askEmail && email ? { email } : fromFloor.email ? { email: fromFloor.email } : {}),
        ...(askPhone && phone ? { phone } : fromFloor.phone ? { phone: fromFloor.phone } : {}),
      });
      navigate("/enrol/otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setState("error");
    }
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Loading required fields">
        <EnrolSkeleton />
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          Your details were not saved. Nothing has been sent to the platform.
        </p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={submit}>Try again</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Step 9 of 13">
      <EnrolTitle>Your details for this platform</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        ChainPass needs one of phone or email, plus terms. This platform may ask for more.
        Those extras come from the platform row, never from a constant in this page.
      </p>
      {askUsername ? (
        <EnrolField
          type="text"
          placeholder="Username"
          aria-label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
      ) : null}
      {bothContactRequired ? (
        <>
          <EnrolField
            type="text"
            placeholder="Email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <EnrolField
            type="text"
            placeholder="Phone"
            aria-label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </>
      ) : askEmail ? (
        <EnrolField
          type="text"
          placeholder="Email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      ) : askPhone ? (
        <EnrolField
          type="text"
          placeholder="Phone"
          aria-label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      ) : (
        <EnrolField
          type="text"
          placeholder="Email or phone"
          aria-label="Email or phone"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          autoComplete="email"
        />
      )}
      <label className="my-3 flex items-start gap-2">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          aria-label="I accept the terms and conditions"
        />
        <span>I accept the terms and conditions</span>
      </label>
      <EnrolPrimaryButton onClick={submit} disabled={!termsAccepted}>
        Continue
      </EnrolPrimaryButton>
      <EnrolNote>
        Floor is email or phone plus terms. Username, email and phone as extras come from
        platforms.collection_fields.
      </EnrolNote>
    </EnrolShell>
  );
}
