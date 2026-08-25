import { useNavigate } from "react-router-dom";
import {
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-30 — failures column. Third-attempt selfies. */
export default function ReviewFailures() {
  const navigate = useNavigate();
  return (
    <EnrolShell stepLabel="Failures">
      <EnrolTitle>The failures column</EnrolTitle>
      <EnrolRow label="Queue" value="third-attempt selfies" />
      <EnrolPrimaryButton onClick={() => navigate("/review/side-by-side")}>
        Open side-by-side
      </EnrolPrimaryButton>
      <EnrolNote>17 Aug. A list of failures, never a score.</EnrolNote>
    </EnrolShell>
  );
}
