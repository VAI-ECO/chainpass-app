import {
  EnrolNote,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-43 — providers as rows. Cost is a read. */
export default function MasterProviders() {
  return (
    <EnrolShell stepLabel="Master dashboard · providers">
      <EnrolTitle>Providers</EnrolTitle>
      <EnrolRow label="Rows" value="master.providers" />
      <EnrolRow label="Per attempt" value="providers.per_attempt" />
      <EnrolRow label="State" value="providers.state" />
      <EnrolRow label="Cost" value="providers.cost" />
      <EnrolNote>§5 · §14.4. Cost is a read, never a constant in copy.</EnrolNote>
    </EnrolShell>
  );
}
