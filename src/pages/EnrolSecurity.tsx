import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnrolAlert,
  EnrolField,
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolSkeleton,
  EnrolTitle,
  type EnrolUiState,
} from "@/components/enrol/EnrolShell";
import { getEnrolmentSessionId, invokeEnrol } from "@/lib/enrol";
import { retrievalHeading } from "@/lib/retrieval-brand";

type Option = { id: string; question_text: string };

export default function EnrolSecurity() {
  const navigate = useNavigate();
  const sessionId = getEnrolmentSessionId();
  const [state, setState] = useState<EnrolUiState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [recoveryCodeCount, setRecoveryCodeCount] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [brand, setBrand] = useState("ChainPass");

  useEffect(() => {
    if (!sessionId) {
      setError("session_id required");
      setState("error");
      return;
    }
    invokeEnrol("enrol-security", { session_id: sessionId, action: "options" })
      .then((data) => {
        const list = Array.isArray(data.options) ? (data.options as Option[]) : [];
        const qn = typeof data.question_count === "number" ? data.question_count : 0;
        const cn =
          typeof data.recovery_code_count === "number" ? data.recovery_code_count : 0;
        if (qn < 1 || cn < 1) {
          throw new Error(
            "settings.security_question_count / settings.recovery_code_count not configured"
          );
        }
        setOptions(list);
        setQuestionCount(qn);
        setRecoveryCodeCount(cn);
        if (typeof data.brand === "string" && data.brand.trim()) {
          setBrand(data.brand.trim());
        }
        setPicks(Array.from({ length: qn }, () => ""));
        setAnswers(Array.from({ length: qn }, () => ""));
        setState("default");
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "unknown_error");
        setState("error");
      });
  }, [sessionId]);

  async function save() {
    if (!sessionId) return;
    setState("loading");
    setError(null);
    try {
      const data = await invokeEnrol("enrol-security", {
        session_id: sessionId,
        action: "save",
        questions: picks.map((question_text, i) => ({
          question_text,
          answer: answers[i],
        })),
      });
      const issued = Array.isArray(data.codes) ? data.codes.map(String) : [];
      setCodes(issued);
      setState("default");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setState("error");
    }
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Loading recovery options">
        <EnrolSkeleton />
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={() => setState("default")}>Try again</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  if (codes) {
    return (
      <EnrolShell stepLabel="Step 11 of 13">
        <EnrolTitle>Your one-time passwords</EnrolTitle>
        <EnrolRow label="Count" value="settings:recovery_code_count" />
        <p className="my-2 leading-[1.45]">
          Write these down now. We will not show them again. How many is
          settings:recovery_code_count.
        </p>
        {codes.map((c) => (
          <p key={c} className="my-1 font-mono tracking-wider">
            {c}
          </p>
        ))}
        <label className="my-3 flex items-start gap-2">
          <input
            type="checkbox"
            checked={written}
            onChange={(e) => setWritten(e.target.checked)}
          />
          <span>I have written them down.</span>
        </label>
        <EnrolPrimaryButton
          disabled={!written}
          onClick={() => navigate("/enrol/final")}
        >
          Continue
        </EnrolPrimaryButton>
        <EnrolNote>The retrieval page is before the last V.A.I. page and the handoff.</EnrolNote>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Step 11 of 13">
        <EnrolTitle>{retrievalHeading(brand)}</EnrolTitle>
      <EnrolRow label="Questions" value="settings:security_question_count" />
      <p className="my-2 leading-[1.45]">
        Answers are stored hashed. Nobody at a platform can read them. How many is
        settings:security_question_count.
      </p>
      {picks.map((pick, i) => (
        <div key={i} className="my-3">
          <select
            className="mb-2 w-full rounded border p-2"
            aria-label={`Question ${i + 1}`}
            value={pick}
            onChange={(e) => {
              const next = [...picks];
              next[i] = e.target.value;
              setPicks(next);
            }}
          >
            <option value="">Question {i + 1}</option>
            {options.map((o) => (
              <option key={o.id} value={o.question_text}>
                {o.question_text}
              </option>
            ))}
          </select>
          <EnrolField
            type="text"
            placeholder="Answer"
            aria-label={`Answer ${i + 1}`}
            value={answers[i] ?? ""}
            onChange={(e) => {
              const next = [...answers];
              next[i] = e.target.value;
              setAnswers(next);
            }}
          />
        </div>
      ))}
      <EnrolPrimaryButton
        onClick={save}
        disabled={
          questionCount < 1 ||
          picks.some((p) => !p) ||
          answers.some((a) => !a.trim())
        }
      >
        Continue
      </EnrolPrimaryButton>
    </EnrolShell>
  );
}
