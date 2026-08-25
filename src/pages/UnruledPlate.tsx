import { EnrolNote, EnrolShell, EnrolTitle } from "@/components/enrol/EnrolShell";

/** SN-24 — flag plate. Not a decided screen. */
export default function UnruledPlate() {
  return (
    <EnrolShell stepLabel="Unruled">
      <EnrolTitle>Flagged, not drawn, not decided</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        Payment placement — §2 puts PAY at step 3, §4A.2 starts the deferral clock at
        step 6.
      </p>
      <p className="my-2 leading-[1.45]">
        Deferral visibility — §4A.4 makes it visible to both parties, §4B and §15 item 9
        forbid telling a platform why.
      </p>
      <p className="my-2 leading-[1.45]">Branding — ChainPass mark or skinned per platform.</p>
      <p className="my-2 leading-[1.45]">
        Abandonment — not in the record at any step. Step 7 onward is a live V.A.I. with
        unsigned documents and no baseline.
      </p>
      <p className="my-2 leading-[1.45]">OTP length and expiry — not ruled.</p>
      <p className="my-2 leading-[1.45]">
        Dashboard authentication — the API key is the only ruled identity.
      </p>
      <EnrolNote>Nothing on this list is drawn as if decided. SPEC-DS-01 §3: flagged, not invented.</EnrolNote>
    </EnrolShell>
  );
}
