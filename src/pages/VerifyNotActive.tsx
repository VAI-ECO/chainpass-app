import { useNavigate } from "react-router-dom";
import {
  EnrolNote,
  EnrolPrimaryButton,
  EnrolShell,
  EnrolTitle,
  EnrolWarn,
} from "@/components/enrol/EnrolShell";

/** SN-18 — one word, never why. */
export default function VerifyNotActive() {
  const navigate = useNavigate();
  return (
    <EnrolShell stepLabel="Credential state">
      <EnrolTitle>Not active</EnrolTitle>
      <p className="my-2 leading-[1.45]">This credential is not active.</p>
      <EnrolNote>
        §4B.1 · §4B.3: one word, never why. It covers deferral lapsed, expired, suspended
        and banned, unsorted — and the user never learns which.
      </EnrolNote>
      <EnrolWarn>
        ⚠ No reason is shown and none is returned by the API. Invalid would be a claim
        about the number; expired would be a claim about conduct.
      </EnrolWarn>
      <EnrolPrimaryButton onClick={() => navigate("/renew")}>Continue</EnrolPrimaryButton>
    </EnrolShell>
  );
}
