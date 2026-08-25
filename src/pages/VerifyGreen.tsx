import { EnrolNote, EnrolRow, EnrolShell, EnrolTitle } from "@/components/enrol/EnrolShell";

/** SN-27 — green band only. */
export default function VerifyGreen() {
  return (
    <EnrolShell stepLabel="Result">
      <p className="my-2 font-semibold">GREEN — match</p>
      <EnrolTitle>Verified</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        The user present is the user the credential belongs to.
      </p>
      <EnrolRow label="Credential" value="active" />
      <EnrolNote>
        §7.2: a band comes back, and nothing else does. Never a percentage — the arithmetic
        stays at ChainPass.
      </EnrolNote>
    </EnrolShell>
  );
}
