import {
  EnrolNote,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

/** SN-38 — configuration. Agreement terms edit is inert. */
export default function ClientConfig() {
  return (
    <EnrolShell stepLabel="Client dashboard · configuration">
      <EnrolTitle>Your configuration</EnrolTitle>
      <EnrolRow label="Summary" value="config.summary" />
      <EnrolRow label="Collection spec" value="config.collection_spec" />
      <EnrolRow label="Deferral" value="config.deferral — offered per the platform agreement" />
      <EnrolRow label="Agreement terms" value="inert — contractual, not editable here" />
      <p className="my-2 leading-[1.45]">
        Only the fields in the collection spec cross back at the handoff. Some
        configuration is contractual and not editable from a dashboard. Present and inert
        with the reason stated, never hidden.
      </p>
      <EnrolNote>§14.6 item 6.</EnrolNote>
    </EnrolShell>
  );
}
