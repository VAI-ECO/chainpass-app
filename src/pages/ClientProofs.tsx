import {
  EnrolNote,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-36 — pull a proof. Never-list stated on the surface. */
export default function ClientProofs() {
  return (
    <EnrolShell stepLabel="Client dashboard · proofs">
      <EnrolTitle>Pull a proof</EnrolTitle>
      <EnrolRow label="Credential" value="proofs.credential" />
      <EnrolRow label="Version" value="proofs.version" />
      <EnrolRow label="Signed at" value="proofs.signed_at" />
      <EnrolRow label="Proof of display" value="proofs.display" />
      <p className="my-2 leading-[1.45]">
        A legal name, a document body, a baseline or a percentage is never readable by a
        platform — stated here because this is where someone would look for one.
      </p>
      <EnrolNote>§14.6 item 4 · §14.7 never-list 2.</EnrolNote>
    </EnrolShell>
  );
}
