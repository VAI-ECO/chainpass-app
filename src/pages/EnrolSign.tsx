import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnrolAlert,
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolSecondaryButton,
  EnrolShell,
  EnrolSkeleton,
  EnrolTitle,
  type EnrolUiState,
} from "@/components/enrol/EnrolShell";
import { getEnrolmentSessionId, invokeEnrol } from "@/lib/enrol";

export default function EnrolSign() {
  const navigate = useNavigate();
  const sessionId = getEnrolmentSessionId();
  const [state, setState] = useState<EnrolUiState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [shownVersionId, setShownVersionId] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [effectiveFrom, setEffectiveFrom] = useState<string | null>(null);
  const [bodyText, setBodyText] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("session_id required");
      setState("error");
      return;
    }
    (async () => {
      try {
        const data = await invokeEnrol("agreement-version", {
          session_id: sessionId,
          subtype: "contract",
        });
        const id =
          typeof data.agreement_version_id === "string"
            ? data.agreement_version_id
            : "";
        if (!id) throw new Error("agreement_version_id missing from view");
        setShownVersionId(id);
        setVersion(typeof data.version === "string" ? data.version : null);
        setEffectiveFrom(
          typeof data.effective_from === "string" ? data.effective_from : null
        );
        setBodyText(typeof data.body === "string" ? data.body : null);
        setState("default");
      } catch (e) {
        const message = e instanceof Error ? e.message : "unknown_error";
        setError(message);
        if (/no_current_version/i.test(message)) {
          setState("empty");
          return;
        }
        setState("error");
      }
    })();
  }, [sessionId]);

  async function finishStep8() {
    if (!sessionId) return;
    await invokeEnrol("enrol-requirements", {
      session_id: sessionId,
      complete: true,
    });
    navigate("/enrol/baseline");
  }

  async function sign() {
    if (!sessionId || !shownVersionId) return;
    setState("loading");
    setError(null);
    try {
      await invokeEnrol("sign-contract", {
        session_id: sessionId,
        subtype: "contract",
        shown_version_id: shownVersionId,
      });
      await finishStep8();
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown_error";
      setError(message);
      setState("error");
    }
  }

  async function skip() {
    setState("loading");
    try {
      await finishStep8();
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setState("error");
    }
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Loading the current version">
        <EnrolSkeleton />
      </EnrolShell>
    );
  }

  if (state === "empty") {
    return (
      <EnrolShell stepLabel="Agreement">
        <EnrolTitle>Not required here</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          This platform is not a Pro platform, so no signature agreement applies.
        </p>
        <EnrolNote>§14.1: the signature agreement is included with Pro.</EnrolNote>
        <EnrolPrimaryButton onClick={skip}>Continue</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          The agreement was not signed. The version on file is unchanged.
        </p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={sign}>Try again</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Step 8 of 11 · agreement">
      <EnrolTitle>Signature agreement</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        This is the document that makes your face your signature. You do not have to sign anything — but anything you do sign, you agree in advance is binding.
      </p>
      {version ? <EnrolRow label="Version" value={version} /> : null}
      {effectiveFrom ? <EnrolRow label="Live since" value={effectiveFrom} /> : null}
      <div className="my-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-[#16295f] bg-white p-3 leading-[1.45]">
        {bodyText}
      </div>
      <EnrolPrimaryButton onClick={sign}>I agree to this version</EnrolPrimaryButton>
      <EnrolSecondaryButton onClick={skip}>I do not agree</EnrolSecondaryButton>
      <EnrolNote>
        §4C.2. With it, a platform holds a signature witnessed against a verified identity, not a checkbox. Shown body is stamped to this agreement_version_id.
      </EnrolNote>
    </EnrolShell>
  );
}
