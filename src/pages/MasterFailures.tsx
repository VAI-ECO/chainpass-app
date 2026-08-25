import {
  EnrolNote,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-45 — failures column. Report-fraud inert. Outcome UNRULED. */
export default function MasterFailures() {
  return (
    <EnrolShell stepLabel="Master dashboard · failures">
      <EnrolTitle>Failures for review</EnrolTitle>
      <EnrolRow label="Queue" value="master.failures" />
      <EnrolRow label="Baseline frame" value="failure.baseline" />
      <EnrolRow label="Selfie" value="failure.selfie" />
      <EnrolRow label="Report fraud" value="inert — the outcome is UNRULED" />
      <p className="my-2 leading-[1.45]">
        Staff are looking for obvious fraud, not a score and not a second opinion on the
        match. The member never waits on this queue. It is the provider's own record, not a gate.
      </p>
      <EnrolTitle>The outcome is unruled</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        Ruling 6: nothing, a flag, an order to re-baseline, or a credential state — not
        assigned. The reverse channel does not exist.
      </p>
      <EnrolNote>17 Aug · ruling 6. Flagged, not invented.</EnrolNote>
    </EnrolShell>
  );
}
