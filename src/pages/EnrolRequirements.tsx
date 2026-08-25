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

type ReqItem = {
  key: string;
  display_name: string;
  kind: string;
  on_file: boolean;
};

export default function EnrolRequirements() {
  const navigate = useNavigate();
  const sessionId = getEnrolmentSessionId();
  const [state, setState] = useState<EnrolUiState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ReqItem[]>([]);
  const [leRequired, setLeRequired] = useState(false);

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
          quote_only: true,
        });
        const list = Array.isArray(data.items) ? (data.items as ReqItem[]) : [];
        setItems(list);
        setLeRequired(data.le_required === true);
        setState(list.length === 0 ? "empty" : "default");
      } catch (e) {
        setError(e instanceof Error ? e.message : "unknown_error");
        setState("error");
      }
    })();
  }, [sessionId]);

  function next() {
    if (leRequired) navigate("/enrol/declaration");
    else navigate("/enrol/sign");
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Comparing requirements">
        <EnrolSkeleton />
      </EnrolShell>
    );
  }

  if (state === "empty") {
    return (
      <EnrolShell stepLabel="Step 9 of 13">
        <EnrolTitle>Nothing outstanding</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          Every requirement this platform sets is already on file.
        </p>
        <EnrolPrimaryButton onClick={next}>Continue</EnrolPrimaryButton>
        <EnrolNote>§4D.1 item 5: both outcomes are rendered — this is the second.</EnrolNote>
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        <p className="my-2 leading-[1.45]">Requirements could not be read. Nothing was signed.</p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={() => navigate("/enrol/requirements")}>
          Try again
        </EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Step 9 of 13">
      <EnrolTitle>What this platform requires</EnrolTitle>
      {items.map((item) => (
        <EnrolRow
          key={item.key}
          label={item.display_name}
          value={item.on_file ? "on file" : "not on file"}
        />
      ))}
      <p className="my-2 leading-[1.45]">
        You are asked only for what is genuinely not on file. Anything you have already signed elsewhere is valid here.
      </p>
      <EnrolPrimaryButton onClick={next}>Continue</EnrolPrimaryButton>
      <EnrolNote>§4D.2. Agreements are signed once and valid everywhere.</EnrolNote>
    </EnrolShell>
  );
}
