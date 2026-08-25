import {
  EnrolNote,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-49 — audit log. Delete is inert. */
export default function MasterAudit() {
  return (
    <EnrolShell stepLabel="Master dashboard · audit">
      <EnrolTitle>Audit log</EnrolTitle>
      <EnrolRow label="Log" value="master.audit_log" />
      <EnrolRow label="Actor" value="audit.actor" />
      <EnrolRow label="At" value="audit.at" />
      <EnrolRow label="Action" value="audit.action" />
      <EnrolRow label="Diff" value="audit.diff" />
      <EnrolRow label="Delete" value="inert — immutability is the storage" />
      <EnrolNote>§14.7. An audit entry cannot be altered, including by the provider's own admin.</EnrolNote>
    </EnrolShell>
  );
}
