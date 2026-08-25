import {
  EnrolNote,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-23 — settings sheet. Pointers only. */
export default function AdminRows() {
  return (
    <EnrolShell stepLabel="ChainPass admin">
      <EnrolTitle>Rows and thresholds</EnrolTitle>
      <EnrolRow label="Green band" value="settings:band_green" />
      <EnrolRow label="Yellow band" value="settings:band_yellow" />
      <EnrolRow label="Attempts" value="settings:attempt_count" />
      <EnrolRow label="Plus price" value="settings:price_vai" />
      <EnrolRow label="Pro price" value="settings:price_pro" />
      <p className="my-2 leading-[1.45]">
        Every value here is admin-adjustable without a deploy, and none is a constant in
        code. Every change lands in the audit log.
      </p>
      <EnrolNote>§1.1a · §5 · §7.3 · §14.4. Writes go to MD08.</EnrolNote>
    </EnrolShell>
  );
}
