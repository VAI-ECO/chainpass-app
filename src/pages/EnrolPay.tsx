import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnrolAlert,
  EnrolNote,
  EnrolPrimaryButton,
  EnrolRow,
  EnrolSecondaryButton,
  EnrolShell,
  EnrolSkeleton,
  EnrolTitle,
  EnrolWarn,
  type EnrolUiState,
} from "@/components/enrol/EnrolShell";
import { getEnrolmentSessionId, invokeEnrol } from "@/lib/enrol";

type PayQuote = {
  required_credential_level: number;
  price: number;
  price_standard: number;
  price_pro: number;
  deferral: null | { offered: true; window_hours: number; once_ever: true };
};

export default function EnrolPay() {
  const navigate = useNavigate();
  const sessionId = getEnrolmentSessionId();
  const [state, setState] = useState<EnrolUiState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<PayQuote | null>(null);
  const [deferOpen, setDeferOpen] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError("session_id required");
      setState("error");
      return;
    }
    (async () => {
      try {
        const data = await invokeEnrol("enrol-pay", {
          session_id: sessionId,
          quote_only: true,
        });
        const q = data.quote as PayQuote | undefined;
        if (!q) {
          setState("empty");
          return;
        }
        setQuote(q);
        setState("default");
      } catch (e) {
        const message = e instanceof Error ? e.message : "unknown_error";
        setError(message);
        if (/platform_agreements missing/i.test(message)) {
          setState("empty");
          return;
        }
        setState("error");
      }
    })();
  }, [sessionId]);

  async function choose(choice: "pay" | "defer") {
    if (!sessionId) return;
    setState("loading");
    setError(null);
    try {
      await invokeEnrol("enrol-pay", { session_id: sessionId, choice });
      navigate("/enrol/capture");
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown_error";
      setError(message);
      if (choice === "defer" && /deferral_not_offered/i.test(message)) {
        setDeferOpen(false);
      }
      setState("error");
    }
  }

  if (state === "loading") {
    return (
      <EnrolShell stepLabel="Reading the price sheet">
        <EnrolSkeleton />
      </EnrolShell>
    );
  }

  if (state === "empty") {
    return (
        <EnrolShell stepLabel="Step 2 of 13">
        <EnrolTitle>No level is available</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          This platform&apos;s service level is not set, so there is nothing to buy.
        </p>
        <EnrolNote>§14.1: the level is what the platform&apos;s agreement unlocks.</EnrolNote>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
      </EnrolShell>
    );
  }

  if (deferOpen && quote?.deferral) {
    return (
      <EnrolShell stepLabel="Deferral">
        <EnrolTitle>Verify now, pay within the window</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          You will be verified immediately and the platform will admit you. Payment is due inside the deferral window.
        </p>
        <EnrolRow label="Clock starts" value="at verification, not at payment" />
        <EnrolRow label="Available" value="once ever, per person" />
        <EnrolRow
          label="Window"
          value={`settings:deferral_window_hours (${quote.deferral.window_hours})`}
        />
        <p className="my-2 leading-[1.45]">
          Deferring buys you the window and costs you the same time off the term. At the end of the window use is withheld — not deleted, not banned.
        </p>
        <EnrolPrimaryButton onClick={() => choose("defer")}>
          Defer and verify
        </EnrolPrimaryButton>
        <EnrolSecondaryButton onClick={() => setDeferOpen(false)}>
          Pay now instead
        </EnrolSecondaryButton>
        <EnrolNote>
          §4A.2 · §4A.3. Once ever, per person — not per platform, not per year, because the credential is the user.
        </EnrolNote>
        <EnrolWarn>
          ⚠ Deferral visibility unruled: §4A.4 makes it visible to both parties, §4B and §15 item 9 forbid telling a platform why a credential is not active.
        </EnrolWarn>
      </EnrolShell>
    );
  }

  if (state === "error") {
    return (
      <EnrolShell stepLabel="Payment failed">
        <EnrolTitle>The payment did not complete</EnrolTitle>
        <p className="my-2 leading-[1.45]">
          The card was declined or the payment was interrupted. No credential was issued and the deferral was not used.
        </p>
        {error ? <EnrolAlert>{error}</EnrolAlert> : null}
        <EnrolPrimaryButton onClick={() => choose("pay")}>Try the payment again</EnrolPrimaryButton>
        {quote?.deferral ? (
          <EnrolSecondaryButton onClick={() => setDeferOpen(true)}>
            Verify now, pay within the deferral window
          </EnrolSecondaryButton>
        ) : null}
        <EnrolNote>
          §4A exists for exactly this moment: a member who cannot pay now can still verify now, once ever. The deferral offer re-renders on the failure.
        </EnrolNote>
      </EnrolShell>
    );
  }

  return (
        <EnrolShell stepLabel="Step 2 of 13">
      <EnrolTitle>Choose your level</EnrolTitle>
      <EnrolRow
        label="Plus"
        value={`settings:price_vai${quote ? ` (${quote.price_standard})` : ""}`}
      />
      <EnrolRow
        label="Pro"
        value={`settings:price_vai_pro${quote ? ` (${quote.price_pro})` : ""}`}
      />
      <p className="my-2 leading-[1.45]">
        Each level is valid for every level below it. Pro is valid everywhere.
      </p>
      <EnrolPrimaryButton onClick={() => choose("pay")}>Pay and continue</EnrolPrimaryButton>
      {quote?.deferral ? (
        <EnrolSecondaryButton onClick={() => setDeferOpen(true)}>
          Verify now, pay within the deferral window
        </EnrolSecondaryButton>
      ) : null}
      <EnrolNote>
        Prices are pointers, never figures — §1.1a, OPERATIONS §6. Every price is admin-adjustable without a deploy.
      </EnrolNote>
      <EnrolWarn>
        ⚠ settings:price_access is a pointer to an unruled value — §14.1 prices level 1 nowhere. Not offered here.
      </EnrolWarn>
    </EnrolShell>
  );
}
