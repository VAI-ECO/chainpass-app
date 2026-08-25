import { EnrolNote, EnrolShell, EnrolTitle } from "@/components/enrol/EnrolShell";

/** SN-41 — CD09. Ninth surface unnamed. Reverse channel unruled. */
export default function ClientUnruled() {
  return (
    <EnrolShell stepLabel="Client dashboard · unruled">
      <EnrolTitle>A ninth surface, unnamed</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        §14.6 lists eight client surfaces. This ninth is numbered and unnamed. The reverse
        channel is the strongest candidate and is explicitly not assigned.
      </p>
      <p className="my-2 leading-[1.45]">
        UNRULED. The reverse channel does not exist — two orders and fraud-found cannot be
        sent. Nothing on this plate is drawn as if decided.
      </p>
      <EnrolNote>CD09 · §14.8. Flagged, not invented.</EnrolNote>
    </EnrolShell>
  );
}
