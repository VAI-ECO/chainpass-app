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

type SettingRow = {
  key: string;
  group: string;
  value: string;
  scope: string;
};

type Pane = "list" | "bands" | "change";

/**
 * SN-44 — master settings. Keys listed; values never printed into list copy.
 * Save writes settings_audit (actor, before, after).
 */
export default function MasterSettings() {
  const [pane, setPane] = useState<Pane>("list");
  const [rows, setRows] = useState<SettingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [draft, setDraft] = useState("");
  const [lastAudit, setLastAudit] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const data = await invokeEnrol("master-settings", { action: "list" });
      const list = Array.isArray(data.settings) ? (data.settings as SettingRow[]) : [];
      setRows(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const bandKeys = rows.filter((r) => r.group === "Bands");

  const openChange = (key: string) => {
    const row = rows.find((r) => r.key === key);
    setSelectedKey(key);
    setDraft(row?.value ?? "");
    setLastAudit(null);
    setPane("change");
  };

  const save = async () => {
    if (!selectedKey) return;
    setBusy(true);
    setError(null);
    setLastAudit(null);
    try {
      const data = await invokeEnrol("master-settings", {
        action: "set",
        key: selectedKey,
        value: draft,
        actor: "master",
      });
      if (data.status === "saved" && data.audit && typeof data.audit === "object") {
        setLastAudit("audit.entry — actor, timestamp, before and after");
      } else if (data.status === "unchanged") {
        setLastAudit("unchanged — no audit row");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (pane === "bands") {
    return (
      <EnrolShell stepLabel="Master dashboard · settings · bands">
        <EnrolTitle>Bands</EnrolTitle>
        <EnrolRow label="Table" value="settings.bands" />
        {bandKeys.length === 0 ? (
          <EnrolWarn>No band keys in master.settings yet.</EnrolWarn>
        ) : (
          bandKeys.map((r) => (
            <EnrolRow
              key={r.key}
              label={r.key}
              value="Read — adjustable without a deploy"
            />
          ))
        )}
        <p className="my-2 leading-[1.45]">
          A platform reads a band, never a number. The arithmetic never leaves.
        </p>
        <EnrolPrimaryButton onClick={() => setPane("list")}>Back</EnrolPrimaryButton>
        <EnrolNote>§7.3 · SN-44 bands.</EnrolNote>
      </EnrolShell>
    );
  }

  if (pane === "change") {
    return (
      <EnrolShell stepLabel="Master dashboard · settings · change">
        <EnrolTitle>Change a setting</EnrolTitle>
        <EnrolRow label="Key" value={selectedKey || "—"} />
        <label className="my-2 block text-[13px] uppercase tracking-[0.06em] text-[#555]">
          New value
          <input
            className="mt-1 w-full rounded border border-[#ccc] bg-white p-2.5 text-base text-[#16295f]"
            data-wire="settings.new_value"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoComplete="off"
          />
        </label>
        {error ? <EnrolWarn>{error}</EnrolWarn> : null}
        {lastAudit ? <EnrolRow label="Logged" value={lastAudit} /> : null}
        <EnrolPrimaryButton onClick={() => void save()} disabled={busy || !selectedKey}>
          Save
        </EnrolPrimaryButton>
        <EnrolPrimaryButton onClick={() => setPane("list")} disabled={busy}>
          Back
        </EnrolPrimaryButton>
        <EnrolNote>
          settings.save → audit.entry. Existing items keep the period they were created under.
        </EnrolNote>
      </EnrolShell>
    );
  }

  return (
    <EnrolShell stepLabel="Master dashboard · settings">
      <EnrolTitle>Settings</EnrolTitle>
      <EnrolRow label="Table" value="master.settings" />
      <EnrolRow label="Bands" value="settings.bands" />
      <EnrolRow label="Save" value="settings.save → audit.entry" />
      <p className="my-2 leading-[1.45]">
        Every figure in every canon is a pointer at a row on this screen. No value is printed
        into copy on the list — open a key to change it.
      </p>
      {error ? <EnrolWarn>{error}</EnrolWarn> : null}
      {rows.length === 0 && !error ? (
        <EnrolWarn>Loading master.settings…</EnrolWarn>
      ) : (
        <div className="my-3 space-y-1">
          {rows.map((r) => (
            <button
              key={r.key}
              type="button"
              className="flex w-full justify-between gap-3 border-b border-[#ddd] py-2 text-left"
              onClick={() => openChange(r.key)}
            >
              <span className="font-mono text-[14px]">{r.key}</span>
              <strong className="text-[13px] font-normal text-[#555]">
                {r.group} · Read · {r.scope}
              </strong>
            </button>
          ))}
        </div>
      )}
      <EnrolPrimaryButton onClick={() => setPane("bands")}>Bands</EnrolPrimaryButton>
      <EnrolNote>§1.1a · §7.3 · 17 Aug · SN-44. public.settings is key·value — not the old singleton.</EnrolNote>
    </EnrolShell>
  );
}
