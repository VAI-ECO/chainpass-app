import { useEffect, useState } from "react";
import {
  EnrolNote,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";
import { invokeEnrol } from "@/lib/enrol";

/** SN-39 — declared health. Never inferred. */
export default function ClientHealth() {
  const [signal, setSignal] = useState("health.signal");
  useEffect(() => {
    invokeEnrol("health", {})
      .then((data) => {
        const status = typeof data.status === "string" ? data.status : "declared";
        setSignal(`${status} — declared, never inferred`);
      })
      .catch(() => {
        setSignal("unreadable — declared, never inferred");
      });
  }, []);

  return (
    <EnrolShell stepLabel="Client dashboard · health">
      <EnrolTitle>Facial recognition is available</EnrolTitle>
      <EnrolRow label="Signal" value={signal} />
      <EnrolRow label="History" value="health.history" />
      <EnrolRow label="Image serve" value="separate from the matcher" />
      <p className="my-2 leading-[1.45]">Declared, not inferred.</p>
      <EnrolNote>§14.6 item 7 · §14.4.</EnrolNote>
    </EnrolShell>
  );
}
