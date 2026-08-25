import { useEffect, useState } from "react";
import {
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
  EnrolWarn,
} from "@/components/enrol/EnrolShell";
import { invokeEnrol } from "@/lib/enrol";

/** SN-34 — blocks remaining and purchase. Alert level is a setting. */
export default function ClientBlocks() {
  const [remaining, setRemaining] = useState("blocks.remaining");
  const [burnRate, setBurnRate] = useState("blocks.burn_rate");
  const [projection, setProjection] = useState("blocks.projection");
  const [alertLow, setAlertLow] = useState(false);

  useEffect(() => {
    invokeEnrol("blocks", {})
      .then((data) => {
        if (typeof data.remaining === "number" || typeof data.remaining === "string") {
          setRemaining(String(data.remaining));
        }
        if (typeof data.burn_per_hour === "number") {
          setBurnRate(String(data.burn_per_hour));
        }
        if (typeof data.projected_empty_at === "string" || data.projected_empty_at === null) {
          setProjection(
            data.projected_empty_at == null
              ? "blocks.projection"
              : String(data.projected_empty_at)
          );
        }
        setAlertLow(data.alert_low === true);
      })
      .catch(() => {
        setRemaining("blocks.remaining");
      });
  }, []);

  return (
    <EnrolShell stepLabel="Client dashboard · blocks">
      <EnrolTitle>Blocks</EnrolTitle>
      <EnrolRow label="Remaining" value={remaining} />
      <EnrolRow label="Burn rate" value={burnRate} />
      <EnrolRow label="Projection" value={projection} />
      <EnrolRow label="Alert when low" value="settings:blocks_alert_threshold" />
      {alertLow ? (
        <EnrolWarn>Remaining is at or below settings:blocks_alert_threshold.</EnrolWarn>
      ) : null}
      <EnrolPrimaryButton
        onClick={() => {
          invokeEnrol("blocks", { purchase: true }).catch(() => undefined);
        }}
      >
        Buy more
      </EnrolPrimaryButton>
      <p className="my-2 leading-[1.45]">
        When remaining is exhausted, verifications cannot run. That is a condition, not a
        fault. Purchase opens the provider flow — no price is written here.
      </p>
      <EnrolNote>
        §14.6 item 2. Counts are endpoint reads. The alert level is a setting, never a
        constant.
      </EnrolNote>
    </EnrolShell>
  );
}
