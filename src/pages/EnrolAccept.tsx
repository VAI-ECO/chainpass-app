import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnrolAlert,
  EnrolNote,
  EnrolPrimaryButton,
  EnrolShell,
  EnrolSkeleton,
  EnrolTitle,
  type EnrolUiState,
} from "@/components/enrol/EnrolShell";
import { getEnrolmentSessionId, invokeEnrol } from "@/lib/enrol";

export default function EnrolAccept() {
  const navigate = useNavigate();
  const sessionId = getEnrolmentSessionId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<EnrolUiState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [shownVersionId, setShownVersionId] = useState<string | null>(null);
  const [bodyText, setBodyText] = useState<string | null>(null);
  const [next, setNext] = useState<"baseline" | "requirements">("baseline");

  useEffect(() => {
    if (!sessionId) {
      setError("session_id required");
      setState("error");
      return;
    }
    (async () => {
      try {
        const data = await invokeEnrol("enrol-accept", {
          session_id: sessionId,
          action: "view",
        });
        setShownVersionId(
          typeof data.shown_version_id === "string" ? data.shown_version_id : null
        );
        setBodyText(typeof data.body === "string" ? data.body : null);
        setNext(data.next === "requirements" ? "requirements" : "baseline");
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
        } catch {
          /* camera opens when the member checks the box */
        }
        setState("default");
      } catch (e) {
        setError(e instanceof Error ? e.message : "unknown_error");
        setState("error");
      }
    })();
  }, [sessionId]);

  async function accept() {
    if (!sessionId || !shownVersionId) return;
    if (!checked) {
      setError("terms_checkbox_required");
      setState("error");
      return;
    }
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) {
      setError("acceptance_capture_required");
      setState("error");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("acceptance_capture_required");
      setState("error");
      return;
    }
    ctx.drawImage(video, 0, 0);
    const capture = canvas.toDataURL("image/jpeg", 0.9);
    setState("loading");
    setError(null);
    try {
      const data = await invokeEnrol("enrol-accept", {
        session_id: sessionId,
        action: "accept",
        terms_checked: true,
        shown_version_id: shownVersionId,
        capture,
      });
      if (data.next === "requirements") navigate("/enrol/requirements");
      else navigate("/enrol/baseline");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setState("error");
    }
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Loading terms">
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

  return (
    <EnrolShell stepLabel="Step 10 of 13">
      <EnrolTitle>Accept the platform terms</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        You do not have to read them. The box must be checked before the second capture.
      </p>
      {bodyText ? (
        <pre className="my-3 max-h-48 overflow-auto whitespace-pre-wrap text-[13px] leading-[1.4]">
          {bodyText}
        </pre>
      ) : null}
      <label className="my-3 flex items-start gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          aria-label="I accept these terms"
        />
        <span>I accept these terms</span>
      </label>
      <video
        ref={videoRef}
        className="my-2 w-full rounded"
        muted
        playsInline
        aria-label="Second capture"
      />
      <EnrolPrimaryButton onClick={accept} disabled={!checked}>
        Continue
      </EnrolPrimaryButton>
      <EnrolNote>
        No terms accepted, no second capture, no baseline. Law enforcement is its own act, not this box.
      </EnrolNote>
    </EnrolShell>
  );
}
