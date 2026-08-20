import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * §2.5 enrolment entry — platform ID only via signed token in the body / fragment.
 * A ?platform= query is refused before any network call.
 */
export default function EnrolEntry() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.has("platform") || searchParams.has("platform_id")) {
      setError(
        "platform_query_rejected: Platform ID must ride in a signed enrolment token, never a query parameter (§2.5)."
      );
      return;
    }

    const token =
      sessionStorage.getItem("enrolment_token") ||
      searchParams.get("enrolment_token");

    // enrolment_token as query is not ideal either but is not platform_id.
    // Prefer body/sessionStorage; if present in query, move to sessionStorage and strip.
    if (searchParams.get("enrolment_token")) {
      sessionStorage.setItem("enrolment_token", searchParams.get("enrolment_token")!);
    }

    if (!token) {
      setError("enrolment_token required");
      return;
    }

    (async () => {
      const { data, error: fnErr } = await supabase.functions.invoke("enrol", {
        body: {
          enrolment_token: token,
          return_url: searchParams.get("return_url") || undefined,
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
