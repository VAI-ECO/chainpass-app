import { useNavigate } from "react-router-dom";
import {
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-21 — a different platform. Administered, no charge. */
export default function VerifyCrossPlatform() {
  const navigate = useNavigate();
  return (
    <EnrolShell stepLabel="A different platform">
      <EnrolTitle>One more thing needed here</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        Your credential is valid at this platform. This platform requires one item you
        have not yet signed — ChainPass administers it, at no charge to you.
      </p>
      <EnrolRow label="Already on file" value="on file" />
      <EnrolRow label="Needed here" value="not on file" />
      <EnrolRow label="Charge to you" value="none" />
      <EnrolPrimaryButton onClick={() => navigate("/verify/shortfall")}>
        Sign it now
      </EnrolPrimaryButton>
      <EnrolNote>
        §4C.3: the platform sets its requirements, ChainPass administers them, and there
        is no charge to the member for them.
      </EnrolNote>
    </EnrolShell>
  );
}
