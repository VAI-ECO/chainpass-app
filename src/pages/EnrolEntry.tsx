import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  EnrolAlert,
  EnrolNote,
  EnrolPrimaryButton,
  EnrolShell,
  EnrolSkeleton,
  EnrolTitle,
  EnrolWarn,
  type EnrolUiState,
} from "@/components/enrol/EnrolShell";
import {
  ENROLMENT_TOKEN_KEY,
  QUERY_FORBIDDEN,
  invokeEnrol,
  setEnrolmentSessionId,
} from "@/lib/enrol";

function tokenFromFragment(): string | null {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  return (
    params.get("enrolment_token") ||
    params.get("enrollment_token") ||
    params.get("token") ||
    null
  );
}

function clearFragmentToken() {
  if (window.location.hash) {
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  }
}

export default function EnrolEntry() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<EnrolUiState>("default");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    for (const key of searchParams.keys()) {
      if (QUERY_FORBIDDEN.has(key.toLowerCase())) {
        setError(
          "token_query_rejected: Enrolment token and platform ID must ride in the request body or header, never a query parameter (§2.5)."
        );
        setState("error");
        return;
      }
    }

    const fromStore = sessionStorage.getItem(ENROLMENT_TOKEN_KEY);
    const fromHash = tokenFromFragment();
    if (fromHash) {
      sessionStorage.setItem(ENROLMENT_TOKEN_KEY, fromHash);
      clearFragmentToken();
    }
    setToken(fromStore || fromHash);
  }, [searchParams]);

  async function begin() {
    if (!token) {
      setError("enrolment_token required");
      setState("error");
      return;
    }
    setState("loading");
    setError(null);
    try {
      const data = await invokeEnrol(
        "enrol",
        { enrolment_token: token },
        { "X-Enrolment-Token": token }
      );
      const sessionId = String(data.session_id ?? "");
      if (!sessionId) throw new Error("session_id missing from enrol");
      setEnrolmentSessionId(sessionId);
      sessionStorage.removeItem(ENROLMENT_TOKEN_KEY);
      navigate("/enrol/keep");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown_error";
      setError(message);
      if (/unknown_platform/i.test(message)) {
        setState("empty");
        return;
      }
      setState("error");
    }
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Opening session">
        <EnrolSkeleton />
      </EnrolShell>
    );
  }

  if (state === "empty") {
    return (
      <EnrolShell stepLabel="Step 1 of 13">
        <EnrolTitle>Verify once. Use it everywhere.</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          This platform has not finished onboarding — no collection spec is on file, so there is nothing to begin.
        </p>
        <EnrolNote>
          §2.3: the platform declares what it collects at onboarding. Absent, enrolment cannot open.
        </EnrolNote>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          The session could not be opened. Nothing has been created and you have not been charged.
        </p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={begin}>Begin again</EnrolPrimaryButton>
        <EnrolNote>
          The enrolment row stays server-side and survives a closed browser — SPEC-CP-01 §2.5.
        </EnrolNote>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Step 1 of 13">
      <EnrolTitle>Verify once. Use it everywhere.</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        A ChainPass credential is issued to you, not to this platform. Verify here and the same credential works on every participating platform.
      </p>
      <EnrolPrimaryButton onClick={begin} disabled={!token}>
        Begin
      </EnrolPrimaryButton>
      {!token ? (
        <EnrolAlert>enrolment_token required</EnrolAlert>
      ) : null}
      <EnrolNote>
        No identifier on this URL — §2.5. The session lives in an httpOnly cookie.
      </EnrolNote>
      <EnrolWarn>
        ⚠ Branding unruled: ChainPass mark or platform skin. Drawn with the mark.
      </EnrolWarn>
    </EnrolShell>
  );
}
