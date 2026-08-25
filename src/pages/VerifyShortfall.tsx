import { useLocation, useNavigate } from "react-router-dom";
import {
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";

type MissingItem = {
  kind?: string;
  key?: string;
  display_name?: string;
};

type RouteInfo = {
  url?: string;
  enrolment_token?: string | null;
};

/**
 * SN-19 — list + transport. Asking party is told only "not met".
 */
export default function VerifyShortfall() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as {
    missing?: MissingItem[];
    route?: RouteInfo;
    asking_party?: boolean;
  };
  const missing = Array.isArray(state.missing) ? state.missing : [];
  const route = state.route;

  if (state.asking_party) {
    return (
      <EnrolShell stepLabel="Requirements">
        <EnrolTitle>Requirements are not met</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          The other party has been told what to complete. You are not told which item.
        </p>
        <EnrolNote>§11.3: the asking party learns only that requirements are not met.</EnrolNote>
      </EnrolShell>
    );
  }

  if (missing.length === 0) {
    return (
      <EnrolShell stepLabel="Requirements">
        <EnrolTitle>All requirements met</EnrolTitle>
        <p className="my-2 leading-[1.45]">Nothing is outstanding.</p>
        <EnrolNote>§11.2.</EnrolNote>
      </EnrolShell>
    );
  }

  function go() {
    const url = route?.url;
    if (!url) return;
    if (url.startsWith("/")) navigate(url === "/verify/shortfall" ? "/enrol" : url);
    else window.location.assign(url);
  }

  return (
    <EnrolShell stepLabel="Requirements">
      <EnrolTitle>Requirements are not met</EnrolTitle>
      <p className="my-2 leading-[1.45]">
        One or more of this platform&apos;s requirements is not on file. Here is where to
        satisfy them.
      </p>
      <EnrolRow label="Outstanding" value={`${missing.length} items`} />
      {missing.map((item, i) => (
        <EnrolRow
          key={`${item.key ?? item.kind ?? i}`}
          label={item.display_name ?? item.key ?? item.kind ?? "requirement"}
          value="not on file"
        />
      ))}
      <EnrolRow label="Which items the other party sees" value="none" />
      <EnrolPrimaryButton onClick={go}>Satisfy them now</EnrolPrimaryButton>
      <EnrolNote>
        §11.3: the asking party is told only that requirements are not met, never which one.
      </EnrolNote>
    </EnrolShell>
  );
}
