import {
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";
import { invokeEnrol } from "@/lib/enrol";

/** SN-40 — API keys. Session key is not an endpoint. */
export default function ClientKeys() {
  return (
    <EnrolShell stepLabel="Client dashboard · keys">
      <EnrolTitle>API keys</EnrolTitle>
      <EnrolRow label="Current keys" value="keys.list" />
      <EnrolRow label="Session key" value="never — there is nothing to read" />
      <EnrolPrimaryButton
        onClick={() => {
          invokeEnrol("generate-api-key", {}).catch(() => undefined);
        }}
      >
        Issue a key
      </EnrolPrimaryButton>
      <EnrolPrimaryButton
        onClick={() => {
          invokeEnrol("regenerate-api-key", {}).catch(() => undefined);
        }}
      >
        Rotate
      </EnrolPrimaryButton>
      <p className="my-2 leading-[1.45]">
        Copy it now if one is issued. The session key left once at the handoff. We do not
        have it.
      </p>
      <EnrolNote>§14.6 item 8 · rule 2 · rule 3. The API key is the identity the provider knows.</EnrolNote>
    </EnrolShell>
  );
}
