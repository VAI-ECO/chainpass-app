import { useNavigate } from "react-router-dom";
import {
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-17 — re-baseline required. Fourth state. Cost is ChainPass's. */
export default function VerifyRebaseline() {
  const navigate = useNavigate();
  return (
    <EnrolShell stepLabel="Verification">
      <EnrolTitle>We need a fresh baseline</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        Your face has changed enough that the stored baseline no longer matches reliably. A
        fresh verification is required — at ChainPass&apos;s cost, not yours.
      </p>
      <EnrolRow label="Reds on this credential" value="past settings:reds_threshold" />
      <EnrolRow label="Cost to you" value="none" />
      <EnrolPrimaryButton onClick={() => navigate("/enrol/capture")}>
        Re-verify now
      </EnrolPrimaryButton>
      <EnrolNote>
        §9.1 items 2–3: past the threshold the next failure returns a fourth state,
        re-baseline required, and the fresh verification is at our cost.
      </EnrolNote>
    </EnrolShell>
  );
}
