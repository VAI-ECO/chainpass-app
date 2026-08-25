import {
  EnrolNote,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-42 — platforms as rows. Suspend writes audit. */
export default function MasterPlatforms() {
  return (
    <EnrolShell stepLabel="Master dashboard · platforms">
      <EnrolTitle>Platforms</EnrolTitle>
      <EnrolRow label="Rows" value="master.platforms" />
      <EnrolRow label="Level" value="platform.level" />
      <EnrolRow label="Collection spec" value="platform.collection_spec" />
      <EnrolRow label="Requirements" value="platform.requirements" />
      <EnrolRow label="Keys" value="platform.keys" />
      <EnrolRow label="Suspend" value="platform.suspend → audit.entry" />
      <p className="my-2 leading-[1.45]">
        Suspend a platform writes the reason to the audit log. There is nothing
        platform-specific in the shape of this list.
      </p>
      <EnrolNote>§14.7 · §14.2b.</EnrolNote>
    </EnrolShell>
  );
}
