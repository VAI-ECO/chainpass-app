import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * §2.5 / §15 item 14 — enrolment token never in the query string.
 * Token arrives via sessionStorage, Authorization header path (body to enrol),
 * or URL fragment (fragment is not logged by servers). Query ?token= / ?platform= refused.
 */

const QUERY_FORBIDDEN = new Set([
  "token",
  "enrolment_token",
  "enrollment_token",
  "platform",
  "platform_id",
]);

function tokenFromFragment(): string | null {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  return (
    params.get("enrolment_token") ||
    params.get("enrollment_token") ||
    params.get("token") ||
    null
  );
}

function clearFragmentToken() {
  if (window.location.hash) {
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  }
}

export default function EnrolEntry() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    for (const key of searchParams.keys()) {
      if (QUERY_FORBIDDEN.has(key.toLowerCase())) {
        setError(
          "token_query_rejected: Enrolment token and platform ID must ride in the request body or header, never a query parameter (§2.5)."
        );
        return;
      }
    }

    const token =
      sessionStorage.getItem("enrolment_token") || tokenFromFragment();

    if (tokenFromFragment()) {
      sessionStorage.setItem("enrolment_token", token!);
      clearFragmentToken();
    }

    if (!token) {
      setError("enrolment_token required");
      return;
    }

    (async () => {
      // Body carries the signed token; Authorization also set so proxies never need query.
      const { data, error: fnErr } = await supabase.functions.invoke("enrol", {
        body: {
          enrolment_token: token,
          return_url: undefined,
        },
        headers: {
          "X-Enrolment-Token": token,
        },
      });
      if (fnErr) {
        setError(fnErr.message);
        return;
      }
      if (data?.error) {
        setError(String(data.error));
        return;
      }
      setSessionId(data.session_id);
      sessionStorage.setItem("enrolment_session_id", data.session_id);
      sessionStorage.removeItem("enrolment_token");
    })();
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-6 text-neutral-100">
        <p role="alert">{error}</p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-6 text-neutral-100">
        <p>Opening enrolment…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-6 text-neutral-100">
      <p>Enrolment open. Step 1 — landing.</p>
    </div>
  );
}
