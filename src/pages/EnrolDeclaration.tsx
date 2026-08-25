import { useEffect, useState } from "react";
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

export default function EnrolDeclaration() {
  const navigate = useNavigate();
  const sessionId = getEnrolmentSessionId();
  const [state, setState] = useState<EnrolUiState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [required, setRequired] = useState(false);
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
        const data = await invokeEnrol("enrol-requirements", {
          session_id: sessionId,
          quote_declaration: true,
        });
        if (data.required !== true) {
          setState("empty");
          return;
        }
        setRequired(true);
        setVersion(typeof data.version === "string" ? data.version : null);
        setEffectiveFrom(
          typeof data.effective_from === "string" ? data.effective_from : null
        );
        setBodyText(typeof data.body === "string" ? data.body : null);
        setState("default");
      } catch (e) {
        setError(e instanceof Error ? e.message : "unknown_error");
        setState("error");
      }
    })();
  }, [sessionId]);

  async function declare() {
    if (!sessionId) return;
    setState("loading");
    try {
      await invokeEnrol("enrol-requirements", {
        session_id: sessionId,
        law_enforcement_declared: true,
      });
      navigate("/enrol/sign");
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

  if (state === "empty" || !required) {
    return (
      <EnrolShell stepLabel="Declaration">
        <EnrolTitle>Not required here</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          This platform does not require a law enforcement declaration.
        </p>
        <EnrolPrimaryButton onClick={() => navigate("/enrol/sign")}>
          Continue
        </EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          The declaration was not signed. The version on file is unchanged.
        </p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={declare}>Try again</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Step 9 of 13 · declaration">
      <EnrolTitle>Law enforcement declaration</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        You are stating whether you are affiliated with law enforcement. This platform requires the declaration; ChainPass administers it.
      </p>
      {version ? <EnrolRow label="Version" value={version} /> : null}
      {effectiveFrom ? <EnrolRow label="Live since" value={effectiveFrom} /> : null}
      <p className="my-2 whitespace-pre-wrap rounded-lg border border-[#16295f] bg-white p-3 leading-[1.45]">
        {bodyText ||
          "You are stating whether you are affiliated with law enforcement. This declaration is held at ChainPass, immutable and versioned."}
      </p>
      <EnrolPrimaryButton onClick={declare}>I agree to this version</EnrolPrimaryButton>
      <EnrolNote>
        §14.2 item 4: your signature is stamped to the exact version you saw. LE is a declaration, not an agreement_versions subtype.
      </EnrolNote>
    </EnrolShell>
  );
}
