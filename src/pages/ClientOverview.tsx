import { useNavigate } from "react-router-dom";
import {
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-33 — traffic scoped to the key. No session-key endpoint. */
export default function ClientOverview() {
  const navigate = useNavigate();
  return (
    <EnrolShell stepLabel="Client dashboard · overview">
      <EnrolTitle>Your traffic</EnrolTitle>
      <EnrolRow label="Verifications run" value="traffic.verifications" />
      <EnrolRow label="Gate passes" value="traffic.passes" />
      <EnrolRow label="Gate fails" value="traffic.fails" />
      <EnrolRow label="Enrolments you originated" value="traffic.originated" />
      <EnrolRow label="Series" value="traffic.series" />
      <p className="my-2 leading-[1.45]">
        Scoped to your key. You read only your own platform. Another platform is
        unreachable by construction, not by permission.
      </p>
      <EnrolTitle>There is nothing to read</EnrolTitle>
      <EnrolRow label="An endpoint for the session key" value="None, and never will be" />
      <EnrolRow label="Where it went" value="Handed over once, at the handoff" />
      <EnrolRow label="The copy held here" value="Deleted" />
      <p className="my-2 leading-[1.45]">Not withheld. We do not have it.</p>
      <EnrolPrimaryButton onClick={() => navigate("/client/config")}>
        Check your configuration
      </EnrolPrimaryButton>
      <EnrolNote>
        §14.6 item 1 · rule 2. Every value is an endpoint read. A legal name, a document, a
        baseline or a percentage is never readable by any platform.
      </EnrolNote>
    </EnrolShell>
  );
}
