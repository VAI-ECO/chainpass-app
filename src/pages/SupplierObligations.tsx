import { useEffect, useState } from "react";
import {
  EnrolNote,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";
import { invokeEnrol } from "@/lib/enrol";

/** SN-32 — declared health; image serve separate from matcher. */
export default function SupplierObligations() {
  const [health, setHealth] = useState("declared, never inferred");
  useEffect(() => {
    invokeEnrol("health", {})
      .then((data) => {
        const status = typeof data.status === "string" ? data.status : "declared";
        setHealth(`${status} — declared, never inferred`);
      })
      .catch(() => {
        setHealth("unreadable — declared, never inferred");
      });
  }, []);

  return (
    <EnrolShell stepLabel="Supplier obligations">
      <EnrolTitle>What the facial stack owes</EnrolTitle>
      <EnrolRow label="Health" value={health} />
      <EnrolRow label="Image serve" value="separate deploy" />
      <EnrolRow label="Recovery" value="duplicate detection returns the same key" />
      <EnrolRow label="Premium engine" value="last attempt, selfie taken" />
      <EnrolNote>
        17 Aug, facial stack: these are supplier duties, stated so a provider swap cannot
        silently drop one (§5 · §14.4).
      </EnrolNote>
    </EnrolShell>
  );
}
