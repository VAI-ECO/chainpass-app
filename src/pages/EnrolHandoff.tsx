import { useEffect, useState } from "react";
import {
  EnrolAlert,
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolSkeleton,
  EnrolTitle,
  EnrolWarn,
  type EnrolUiState,
} from "@/components/enrol/EnrolShell";
import { QUERY_FORBIDDEN, getEnrolmentSessionId, invokeEnrol } from "@/lib/enrol";
import { getSettingNumber } from "@/lib/settings";

export default function EnrolHandoff() {
  const sessionId = getEnrolmentSessionId();
  const [state, setState] = useState<EnrolUiState>(sessionId ? "default" : "empty");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const [pollSeconds, setPollSeconds] = useState<number | null>(null);

  useEffect(() => {
    getSettingNumber("handoff_poll_window")
      .then(setPollSeconds)
      .catch(() => setPollSeconds(null));
  }, []);

  async function handoff() {
    if (!sessionId) {
      setState("empty");
      return;
    }
    setState("loading");
    setError(null);
    try {
      const data = await invokeEnrol("enrol-handoff", { session_id: sessionId });
      const url = typeof data.return_url === "string" ? data.return_url : null;
      if (url) {
        try {
          const parsed = new URL(url, window.location.origin);
          let forbidden = false;
          for (const key of parsed.searchParams.keys()) {
            if (QUERY_FORBIDDEN.has(key.toLowerCase())) forbidden = true;
          }
          if (!forbidden) setReturnUrl(parsed.toString());
        } catch {
          setReturnUrl(null);
        }
      }
      setDone(true);
      setState("default");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown_error";
      if (/no_longer_held/i.test(message)) {
        setDone(true);
        setState("default");
        return;
      }
      setError(message);
      setState("error");
    }
  }

  // Loading / finishing race — poll interval is settings:handoff_poll_window (seconds).
  useEffect(() => {
    if (state !== "loading" || pollSeconds == null || pollSeconds <= 0) return;
    const id = window.setInterval(() => {
      handoff().catch(() => undefined);
    }, pollSeconds * 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- poll only while loading
  }, [state, pollSeconds, sessionId]);

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Finishing">
        <EnrolTitle>Finishing up</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          Your credential has been issued. We are waiting for the platform to confirm it has been received.
        </p>
        <EnrolRow label="Poll every" value="settings:handoff_poll_window" />
        <EnrolSkeleton />
        <EnrolNote>
          SPEC-CP-01 §2.5: the redirect will sometimes beat the webhook. This is not an error.
        </EnrolNote>
      </EnrolShell>
    );
  }

  if (state === "empty") {
    return (
      <EnrolShell stepLabel="Step 13 of 13">
        <EnrolTitle>No session found</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          This browser holds no enrolment session. If you started on another device, return using the link the platform sent you.
        </p>
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          The handoff has not completed. Your credential exists and the platform will receive it — this page can be closed safely.
        </p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={handoff}>Check again</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  if (!done) {
    return (
      <EnrolShell stepLabel="Step 13 of 13">
        <EnrolTitle>Back at the platform</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          Your credential is delivered server to server. Nothing about it travels in this URL.
        </p>
        <EnrolPrimaryButton onClick={handoff}>Deliver credential</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Step 13 of 13">
      <EnrolTitle>Back at the platform</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        Your credential has been delivered to the platform, server to server. Nothing about it travelled in your browser.
      </p>
      <EnrolRow label="Delivered" value="V.A.I. · username · contact" />
      <EnrolRow label="Carried in the browser" value="the enrolment session, nothing else" />
      <EnrolRow label="Session key" value="null" />
      {returnUrl ? (
        <EnrolPrimaryButton onClick={() => { window.location.assign(returnUrl); }}>
          Continue to your account
        </EnrolPrimaryButton>
      ) : (
        <EnrolPrimaryButton disabled>Continue to your account</EnrolPrimaryButton>
      )}
      <EnrolNote>
        SPEC-CP-01 §0: the handoff is server to server. A page built to read the credential off the return trip is built wrong.
      </EnrolNote>
      <EnrolWarn>
        ⚠ Handoff payload has no published shape beyond V.A.I. + username + email/phone. session_key is nulled at ChainPass.
      </EnrolWarn>
    </EnrolShell>
  );
}
