import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import {
  resolveCurrentVersion,
  type AgreementSubtype,
} from "../_shared/agreement-version.ts";

/**
 * Resolve-at-view. Same uniqueness rule as sign-contract.
 * Returns the body the member must read. Does not stamp.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405);
    }

    const body = await req.json().catch(() => ({}));
    const session_id = typeof body.session_id === "string" ? body.session_id : "";
    const subtype = body.subtype as AgreementSubtype;

    if (!session_id) return json({ error: "session_id is required" }, 400);
    if (subtype !== "terms" && subtype !== "contract") {
      return json({ error: "subtype must be terms or contract" }, 400);
    }
    if (
      body.agreement_version_id !== undefined ||
      body.version_id !== undefined ||
      body.shown_version_id !== undefined
    ) {
      return json({ error: "client must not choose a version" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, platform_id")
      .eq("id", session_id)
      .maybeSingle();
    if (sessionError) throw new Error(sessionError.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    if (!session.platform_id) {
      return json({ error: "session missing platform_id" }, 400);
    }

    const resolved = await resolveCurrentVersion(
      supabase,
      session.platform_id,
      subtype
    );

    if (resolved.status === "none") {
      return json(
        { error: "no_current_version", platform_id: session.platform_id, subtype },
        404
      );
    }
    if (resolved.status === "multiple") {
      return json(
        {
          error: "multiple_effective_versions",
          count: resolved.version_ids.length,
          version_ids: resolved.version_ids,
        },
        409
      );
    }

    const v = resolved.version;
    return json({
      agreement_version_id: v.id,
      version: v.version,
      effective_from: v.effective_from,
      notice: v.notice,
      body: v.body,
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
