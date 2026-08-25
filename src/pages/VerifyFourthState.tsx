import { useNavigate } from "react-router-dom";
import {
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-29 — fourth state. */
export default function VerifyFourthState() {
  const navigate = useNavigate();
  return (
    <EnrolShell stepLabel="Result">
      <p className="my-2 font-semibold">RE-BASELINE REQUIRED — the fourth state</p>
      <EnrolTitle>A fresh baseline is needed</EnrolTitle>
      <EnrolRow label="Reds on this credential" value="past settings:reds_threshold" />
      <EnrolRow label="Cost to the user" value="none — at ChainPass's cost" />
      <EnrolPrimaryButton onClick={() => navigate("/verify/rebaseline")}>
        Send to re-baseline
      </EnrolPrimaryButton>
      <EnrolNote>
        §9.1 item 2: past the reds threshold the next failure returns this state instead of
        red.
      </EnrolNote>
    </EnrolShell>
  );
}
