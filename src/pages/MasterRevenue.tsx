import {
  EnrolNote,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-47 — revenue by platform. Rate is a setting pointer. */
export default function MasterRevenue() {
  return (
    <EnrolShell stepLabel="Master dashboard · revenue">
      <EnrolTitle>By platform</EnrolTitle>
      <EnrolRow label="Revenue" value="master.revenue" />
      <EnrolRow label="Commission out" value="master.commission_out" />
      <EnrolRow label="Rail" value="payout.rail" />
      <EnrolRow label="Rate" value="settings:commission_rate" />
      <p className="my-2 leading-[1.45]">
        The rate exists operator-side and never crosses to a platform. No figure is written
        into copy.
      </p>
      <EnrolNote>§14.5 · §14.5a.</EnrolNote>
    </EnrolShell>
  );
}
