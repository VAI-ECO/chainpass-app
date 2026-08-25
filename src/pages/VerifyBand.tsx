import { useLocation, useNavigate } from "react-router-dom";
import {
  EnrolNote,
  EnrolPrimaryButton,
  EnrolSecondaryButton,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-28 — both yellow and red, rendered. */
export default function VerifyBand() {
  const navigate = useNavigate();
  const band = (useLocation().state as { band?: string } | null)?.band;
  return (
    <EnrolShell stepLabel="Result">
      <EnrolTitle>Yellow and red</EnrolTitle>
      <p className="my-2 font-semibold">YELLOW — below green</p>
      <p className="my-2 leading-[1.45]">A retry is available. The attempt is counted.</p>
      <EnrolPrimaryButton onClick={() => navigate("/verify/call")}>Retry</EnrolPrimaryButton>
      <p className="my-2 font-semibold">RED — not this user</p>
      <p className="my-2 leading-[1.45]">Red is what triggers the manual path.</p>
      <EnrolSecondaryButton onClick={() => navigate("/verify/last-attempt")}>
        Last attempt
      </EnrolSecondaryButton>
      <EnrolNote>
        §7.2: green match, yellow below green, red not this user.
        {band ? ` This call returned ${band}.` : ""}
      </EnrolNote>
    </EnrolShell>
  );
}
