import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { getEnrolmentSessionId, invokeEnrol } from "@/lib/enrol";

export default function EnrolCapture() {
  const navigate = useNavigate();
  const sessionId = getEnrolmentSessionId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<EnrolUiState>("default");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [providerKey, setProviderKey] = useState<string | null>(null);

  async function startVerification() {
    if (!sessionId) {
      setError("session_id required");
      setState("error");
      return;
    }
    setState("loading");
    setError(null);
    try {
      const data = await invokeEnrol("enrol-capture", {
        session_id: sessionId,
        action: "open_provider",
      });
      if (data.redirect === true || data.redirectUrl) {
        throw new Error("provider_must_be_embedded_not_redirect");
      }
      setToken(typeof data.token === "string" ? data.token : null);
      setProviderKey(
        typeof data.provider_session_key === "string"
          ? data.provider_session_key
          : null
      );
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (cam) {
        setError(
          cam instanceof Error
            ? `camera: ${cam.message}`
            : "camera unavailable — frame cannot be held"
        );
      }
      setState("default");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setState("error");
    }
  }

  async function holdFrame() {
    if (!sessionId) return;
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) {
      setError("held_capture missing — the ChainPass frame was not taken");
      setState("error");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("held_capture missing");
      setState("error");
      return;
    }
    ctx.drawImage(video, 0, 0);
    const capture = canvas.toDataURL("image/jpeg");
    setState("loading");
    try {
      await invokeEnrol("enrol-capture", {
        session_id: sessionId,
        action: "hold",
        capture,
        ...(providerKey ? { provider_session_key: providerKey } : {}),
      });
      navigate("/enrol/reveal");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown_error");
      setState("error");
    }
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Handing you to the provider">
        <EnrolSkeleton />
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Interrupted">
        <EnrolTitle>Your session is held</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          The connection to the provider was interrupted. The session is locked end to end and recoverable up to the handoff — resume from where you stopped, not from the beginning.
        </p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={startVerification}>Resume where I stopped</EnrolPrimaryButton>
        <EnrolNote>
          §2.4: an interruption is recoverable up to the handoff. This attempt has not been counted against you.
        </EnrolNote>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Step 6 of 11">
      <EnrolTitle>The verification company</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        You are now with an approved provider. Your document and your face go to them — never to this platform, and never through it.
      </p>
      <EnrolRow label="Provider" value="settings:provider_active" />
      <EnrolRow label="Attempt" value="settings:attempt_count_n" />
      <p className="my-2 leading-[1.45]">
        The session is locked end to end from here to your baseline.
      </p>
      <div
        id="cp-provider-embed"
        className="my-3 min-h-[220px] rounded-lg border border-[#16295f] bg-white p-3"
        data-embed="true"
        data-redirect="false"
      >
        {token ? (
          <p className="text-sm">
            Provider session is open in this page. Frame is held, not committed.
          </p>
        ) : (
          <p className="text-sm">Provider embed is closed until verification starts.</p>
        )}
        <video ref={videoRef} className="mt-2 w-full rounded" playsInline muted />
      </div>
      {!token ? (
        <EnrolPrimaryButton onClick={startVerification}>Start verification</EnrolPrimaryButton>
      ) : (
        <EnrolPrimaryButton onClick={holdFrame}>Hold frame and continue</EnrolPrimaryButton>
      )}
      <EnrolNote>
        §2.2 · §2.7 item 5. The session lock runs from the company to the baseline. Embedded, not redirected.
      </EnrolNote>
      <EnrolWarn>
        ⚠ Attempt count is a setting of one, two or three — never a constant (17 Aug).
      </EnrolWarn>
    </EnrolShell>
  );
}
