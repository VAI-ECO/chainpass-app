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

type PlatformRow = {
  id: string;
  display_name: string;
  response_level: number;
};

/**
 * SN-42 — platforms as rows. Response level is a value on the row.
 * Changing it here changes what verify returns. No platform writes code.
 */
export default function MasterPlatforms() {
  const [rows, setRows] = useState<PlatformRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastShape, setLastShape] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const data = await invokeEnrol("master-platforms", { action: "list" });
      const list = Array.isArray(data.platforms)
        ? (data.platforms as PlatformRow[])
        : [];
      setRows(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const setLevel = async (id: string, response_level: number) => {
    setBusy(true);
    setError(null);
    try {
      await invokeEnrol("master-platforms", {
        action: "set_response_level",
        id,
        response_level,
      });
      const shaped =
        response_level === 1
          ? "{ match }"
          : response_level === 2
            ? "{ band }"
            : "{ band, percentage }";
      setLastShape(`${id} → ${shaped}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <EnrolShell stepLabel="Master dashboard · platforms">
      <EnrolTitle>Platforms</EnrolTitle>
      <EnrolRow label="Rows" value="master.platforms" />
      <EnrolRow label="Response level" value="platforms.response_level" />
      <p className="my-2 leading-[1.45]">
        ChainPass computes identically in all three. Only what it returns differs.
        A platform changes its level here or asks ChainPass. No platform writes code
        for this.
      </p>
      {error ? <EnrolWarn>{error}</EnrolWarn> : null}
      {lastShape ? <EnrolRow label="Verify shape" value={lastShape} /> : null}
      {rows.map((row) => (
        <div key={row.id} className="my-3 rounded border border-[#ccc] p-3">
          <EnrolRow label="Platform" value={row.display_name || row.id} />
          <EnrolRow label="Level now" value={String(row.response_level ?? 1)} />
          <div className="mt-2 flex flex-wrap gap-2">
            <EnrolPrimaryButton
              disabled={busy}
              onClick={() => void setLevel(row.id, 1)}
            >
              1 · yes or no
            </EnrolPrimaryButton>
            <EnrolPrimaryButton
              disabled={busy}
              onClick={() => void setLevel(row.id, 2)}
            >
              2 · colour
            </EnrolPrimaryButton>
            <EnrolPrimaryButton
              disabled={busy}
              onClick={() => void setLevel(row.id, 3)}
            >
              3 · colour and percentage
            </EnrolPrimaryButton>
          </div>
        </div>
      ))}
      <EnrolNote>§14.7 · RULINGS-CP-04.</EnrolNote>
    </EnrolShell>
  );
}
