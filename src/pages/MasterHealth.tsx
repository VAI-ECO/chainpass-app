import { useEffect, useState } from "react";
import {
  EnrolNote,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";
import { invokeEnrol } from "@/lib/enrol";

/** SN-48 — health switch. Writes audit. */
export default function MasterHealth() {
  const [signal, setSignal] = useState("health.affected");
  useEffect(() => {
    invokeEnrol("health", {})
      .then((data) => {
        const status = typeof data.status === "string" ? data.status : "declared";
        setSignal(status);
      })
      .catch(() => {
        setSignal("unreadable");
      });
  }, []);

  return (
    <EnrolShell stepLabel="Master dashboard · health">
      <EnrolTitle>The switch</EnrolTitle>
      <EnrolRow label="Affected" value={signal} />
      <EnrolRow label="Reds counter" value="master.reds_counter" />
      <EnrolRow label="Reds series" value="master.reds_series" />
      <EnrolRow label="Switch" value="health.switch → audit.entry" />
      <EnrolNote>17 Aug. The switch is an audit write, not a silent flip.</EnrolNote>
    </EnrolShell>
  );
}
