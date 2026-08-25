import {
  EnrolNote,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-46 — credentials by state. Unlock is a constraint, not a permission. */
export default function MasterCredentials() {
  return (
    <EnrolShell stepLabel="Master dashboard · credentials">
      <EnrolTitle>By state</EnrolTitle>
      <EnrolRow label="Rows" value="master.credentials_by_state" />
      <EnrolRow label="Credential" value="credential.id" />
      <EnrolRow label="State" value="credential.state" />
      <EnrolRow label="Level" value="credential.level" />
      <EnrolRow label="Cleared by" value="credential.cleared_by" />
      <EnrolRow label="Unlock" value="inert — the database refuses any other clearer" />
      <p className="my-2 leading-[1.45]">
        One word to a platform, never why. An operator unlock is not a withheld
        permission; it is a constraint.
      </p>
      <EnrolNote>§4B · §9.1 · §14.8 item 6.</EnrolNote>
    </EnrolShell>
  );
}
