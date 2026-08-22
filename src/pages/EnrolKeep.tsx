import { useNavigate } from "react-router-dom";
import {
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";
import { getEnrolmentSessionId } from "@/lib/enrol";

export default function EnrolKeep() {
  const navigate = useNavigate();
  const sessionId = getEnrolmentSessionId();

  if (!sessionId) {
    return (
      <EnrolShell stepLabel="Error">
        <EnrolTitle>Something went wrong</EnrolTitle>
        <p className="my-2 leading-[1.45]">The collection spec could not be read. Nothing was created.</p>
        <EnrolPrimaryButton onClick={() => navigate("/enrol")}>Try again</EnrolPrimaryButton>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Step 2 of 11">
      <EnrolTitle>What we keep</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        ChainPass keeps your face and the result of the check. The platform receives a number and a session key — not your name, not your document, not your photograph.
      </p>
      <EnrolRow label="Held at the provider" value="your identity" />
      <EnrolRow label="Held at ChainPass" value="face · result" />
      <EnrolRow label="Sent to the platform" value="V.A.I. · session key" />
      <EnrolNote>
        §2.1. The identity file stays with the KYC provider. ChainPass does not hold it either.
      </EnrolNote>
      <EnrolPrimaryButton onClick={() => navigate("/enrol/consent")}>
        Continue
      </EnrolPrimaryButton>
    </EnrolShell>
  );
}
