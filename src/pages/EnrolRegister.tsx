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
  const [contact, setContact] = useState("");
  const [askUsername, setAskUsername] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    invokeEnrol("enrol-register", { session_id: sessionId, action: "spec" })
      .then((data) => {
        const required = Array.isArray(data.required) ? data.required : [];
        setAskUsername(required.includes("username"));
      })
      .catch(() => {
        setAskUsername(false);
      });
  }, [sessionId]);

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
      const { email, phone } = splitContact(contact);
      await invokeEnrol("enrol-register", {
        session_id: sessionId,
        ...(askUsername && username ? { username } : {}),
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
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
    <EnrolShell stepLabel="Step 4 of 13">
      <EnrolTitle>Your details for this platform</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        Only what this platform asked for at onboarding. ChainPass carries these fields and keeps none it was not sent.
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
      <EnrolField
        type="text"
        placeholder="Email or phone"
        aria-label="Email or phone"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        autoComplete="email"
      />
      <EnrolPrimaryButton onClick={submit}>Continue</EnrolPrimaryButton>
      <EnrolNote>
        §2.9, the courier rule: no field in the handoff the platform did not send out itself.
      </EnrolNote>
    </EnrolShell>
  );
}
