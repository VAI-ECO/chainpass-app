import { useEffect, useState } from "react";
import {
  EnrolNote,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";
import { invokeEnrol } from "@/lib/enrol";

/** SN-37 — ledger. Rate never crosses to a platform. */
export default function ClientCommission() {
  const [accrued, setAccrued] = useState("commission.accrued");
  useEffect(() => {
    invokeEnrol("commission", {})
      .then((data) => {
        if (typeof data.accrued === "string" || typeof data.accrued === "number") {
          setAccrued(String(data.accrued));
        }
      })
      .catch(() => {
        setAccrued("commission.accrued");
      });
  }, []);

  return (
    <EnrolShell stepLabel="Client dashboard · commission">
      <EnrolTitle>Your ledger</EnrolTitle>
      <EnrolRow label="Accrued" value={accrued} />
      <EnrolRow label="Scheduled" value="commission.scheduled" />
      <EnrolRow label="Paid" value="commission.paid" />
      <EnrolRow label="Rail" value="commission.rail" />
      <p className="my-2 leading-[1.45]">
        Every credential originated pays again at every renewal. The originator keeps
        earning wherever she goes. The rate is never readable here.
      </p>
      <EnrolNote>§14.6 item 5 · §14.5a · §14.7 never-list 2.</EnrolNote>
    </EnrolShell>
  );
}
