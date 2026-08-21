import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";

/**
 * POST /v1/enrol/requirements — §2 step 8.
 * Platform requirements AFTER V.A.I. is live (§2): signature agreement · LE · elected docs.
 * Stamps proofs to agreement_versions ids — ChainPass holds the documents (§14.2).
 * Body: {
 *   session_id,
 *   version_ids: string[],   // agreement_versions.id for each required doc
 *   law_enforcement_declared?: boolean
 * }
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const rejected = refusePlatformQuery(req);
  if (rejected) {
    return new Response(rejected.body, {
      status: rejected.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    const body = await req.json().catch(() => ({}));
    const session_id = typeof body.session_id === "string" ? body.session_id : "";
    if (!session_id) return json({ error: "session_id required" }, 400);

    const version_ids = Array.isArray(body.version_ids)
      ? body.version_ids.filter((v: unknown) => typeof v === "string" && v.trim())
      : [];
    if (version_ids.length === 0) {
      return json({ error: "version_ids required — stamp to exact versions (§14.2)" }, 400);
    }
    if (body.terms_doc_ref !== undefined) {
      return json({ error: "terms_doc_ref_rejected" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error } = await supabase
      .from("sessions")
      .select("id, platform_id, vai, enrolment_step, held_capture")
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    if (!session.vai) {
      return json({ error: "vai_must_be_live_before_requirements" }, 403);
    }
    if ((session.enrolment_step ?? 1) < 7) {
      return json({ error: "enrolment_step_order: reveal at 7 before requirements at 8" }, 403);
    }

    // Every version id must belong to this platform and exist with body held at ChainPass
    for (const vid of version_ids) {
      const { data: ver, error: vErr } = await supabase
        .from("agreement_versions")
        .select("id, platform_id, body, subtype")
        .eq("id", vid)
        .maybeSingle();
      if (vErr) throw new Error(vErr.message);
      if (!ver || ver.platform_id !== session.platform_id || !ver.body) {
        return json({ error: `unknown_or_empty_version_id:${vid}` }, 400);
      }

      const { data: agr, error: aErr } = await supabase
        .from("agreements")
        .insert({
          platform_id: session.platform_id,
          type: "single",
          subtype: ver.subtype === "terms" ? "terms" : "contract",
          vai_1: session.vai.trim(),
          status: "complete",
          content_version_id: ver.id,
          closed_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (aErr) throw new Error(aErr.message);

      const { error: pErr } = await supabase.from("agreement_proofs").insert({
        agreement_id: agr.id,
        agreement_version_id: ver.id,
        vai: session.vai.trim(),
        engine_used: "enrolment_step_8",
      });
      if (pErr) throw new Error(pErr.message);
    }

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        requirements_signed_at: new Date().toISOString(),
        enrolment_step: Math.max(session.enrolment_step, 8),
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    return json({
      status: "requirements_signed",
      step: 8,
      versions_stamped: version_ids.length,
      law_enforcement_declared:
        typeof body.law_enforcement_declared === "boolean"
          ? body.law_enforcement_declared
          : null,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
