import { useNavigate } from "react-router-dom";
import {
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
  EnrolWarn,
} from "@/components/enrol/EnrolShell";

/** SN-16 — last attempt. N and engine are settings, never constants. */
export default function VerifyLastAttempt() {
  const navigate = useNavigate();
  return (
    <EnrolShell stepLabel="Verification">
      <EnrolTitle>This is your last attempt</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        Attempt of settings:attempt_count. This attempt runs on settings:engine_attempt_last, and a
        selfie is taken.
      </p>
      <EnrolRow label="Attempt" value="of settings:attempt_count" />
      <EnrolRow label="Engine" value="settings:engine_attempt_last" />
      <EnrolPrimaryButton onClick={() => navigate("/verify/call")}>
        Try once more
      </EnrolPrimaryButton>
      <EnrolNote>
        17 Aug items 4–5: the last attempt runs on the last-attempt engine wherever one is in
        place, and the selfie is taken there, whatever N is.
      </EnrolNote>
      <EnrolWarn>
        ⚠ Attempt count and last-attempt engine are settings — never constants. Every screen
        reads attempt 1 of N.
      </EnrolWarn>
    </EnrolShell>
  );
}
