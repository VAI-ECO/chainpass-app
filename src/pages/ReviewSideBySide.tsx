import { useNavigate } from "react-router-dom";
import {
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
  EnrolWarn,
} from "@/components/enrol/EnrolShell";

/** SN-31 — baseline + selfie. Reviewer outcome unruled. */
export default function ReviewSideBySide() {
  const navigate = useNavigate();
  return (
    <EnrolShell stepLabel="Review">
      <EnrolTitle>Side-by-side review</EnrolTitle>
      <EnrolRow label="Baseline" value="image serve" />
      <EnrolRow label="Third-attempt selfie" value="image serve" />
      <EnrolWarn>
        ⚠ Reviewer&apos;s outcome is UNRULED (17 Aug · §14.8). The button is a flag, not an
        invention.
      </EnrolWarn>
      <EnrolPrimaryButton onClick={() => navigate("/review/failures")}>
        Back to the queue
      </EnrolPrimaryButton>
      <EnrolNote>Flagged, not invented.</EnrolNote>
    </EnrolShell>
  );
}
