import { useEffect, useState } from "react";
import {
  EnrolNote,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";
import { invokeEnrol } from "@/lib/enrol";

/** SN-35 — documents and versions. Never a legal name. */
export default function ClientAgreements() {
  const [status, setStatus] = useState("agreements.documents");
  useEffect(() => {
    invokeEnrol("agreements", {})
      .then((data) => {
        if (typeof data.status === "string") setStatus(data.status);
      })
      .catch(() => {
        setStatus("agreements.documents");
      });
  }, []);

  return (
    <EnrolShell stepLabel="Client dashboard · agreements">
      <EnrolTitle>Your documents</EnrolTitle>
      <EnrolRow label="Documents" value={status} />
      <EnrolRow label="Versions" value="agreements.versions" />
      <EnrolRow label="Who signed, and when" value="agreements.signatures — credential, version, timestamp" />
      <EnrolRow label="Shortfall" value="agreements.shortfall — a list and a destination" />
      <p className="my-2 leading-[1.45]">
        The version changelog is provider-hosted so immutability never depends on a client
        choosing to build a viewer. A signer is a credential, never a legal name.
      </p>
      <EnrolNote>
        §14.6 item 3 · §14.7 never-list 1. Versions are immutable in storage, including
        against this dashboard.
      </EnrolNote>
    </EnrolShell>
  );
}
