import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";
import { getSetting } from "../_shared/settings.ts";
import {
  bindShownToCurrent,
  resolveCurrentVersion,
} from "../_shared/agreement-version.ts";
import {
  assertTermsChecked,
  nextAfterAcceptance,
  stripPercentFromPublic,
  voidAcceptanceCaptureOnBreak,
} from "../_shared/enrol-accept.ts";

/**
 * POST /v1/enrol/accept — §2 step 8 · RULINGS-CP-03 §1 · §8.
 * Terms checkbox gates frame two. LE is not this checkbox.
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
    const action =
      body.action === "void" ? "void" : body.action === "accept" ? "accept" : "view";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error } = await supabase
      .from("sessions")
      .select(
        "id, platform_id, vai, enrolment_step, held_capture, required_credential_level, acceptance_capture"
      )
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    if (!session.vai) return json({ error: "vai_required_first" }, 403);
    if ((session.enrolment_step ?? 1) < 7 || !session.held_capture) {
      return json({ error: "reveal_required_before_acceptance" }, 403);
    }

    let level = session.required_credential_level as number | null;
    if (level == null && session.platform_id) {
      const { data: plat } = await supabase
        .from("platforms")
        .select("service_level")
        .eq("id", session.platform_id)
        .maybeSingle();
      level = plat?.service_level ?? null;
    }
    const next = nextAfterAcceptance(level);

    if (action === "void") {
      const { error: vErr } = await supabase
        .from("sessions")
        .update(voidAcceptanceCaptureOnBreak())
        .eq("id", session_id);
      if (vErr) throw new Error(vErr.message);
      return json({ status: "acceptance_voided", step: 8, next });
    }

    if (action === "view") {
      if (!session.platform_id) return json({ error: "platform_required" }, 400);
      const resolved = await resolveCurrentVersion(supabase, session.platform_id, "terms");
      if (resolved.status === "none") {
        return json({ error: "no_current_version", subtype: "terms" }, 404);
      }
      if (resolved.status === "multiple") {
        return json({ error: "multiple_effective_versions" }, 409);
      }
      return json({
        status: "view",
        step: 8,
        shown_version_id: resolved.version.id,
        version: resolved.version.version,
        body: resolved.version.body,
        next,
      });
    }

    try {
      assertTermsChecked(body);
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "terms_checkbox_required" }, 403);
    }

    const capture = typeof body.capture === "string" ? body.capture : "";
    if (!capture) return json({ error: "acceptance_capture_required" }, 400);
    const shown_version_id =
      typeof body.shown_version_id === "string" ? body.shown_version_id : "";
    if (!shown_version_id) return json({ error: "shown_version_id required" }, 400);
    if (!session.platform_id) return json({ error: "platform_required" }, 400);

    const resolved = await resolveCurrentVersion(supabase, session.platform_id, "terms");
    if (resolved.status === "none") {
      return json({ error: "no_current_version", subtype: "terms" }, 404);
    }
    if (resolved.status === "multiple") {
      return json({ error: "multiple_effective_versions" }, 409);
    }
    const bound = bindShownToCurrent(shown_version_id, resolved.version.id);
    if (!bound.ok) return json({ error: "stale_document" }, 409);

    const { data: agr, error: aErr } = await supabase
      .from("agreements")
      .insert({
        platform_id: session.platform_id,
        type: "single",
        subtype: "terms",
        vai_1: session.vai.trim(),
        status: "complete",
        content_version_id: resolved.version.id,
        closed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (aErr) throw new Error(aErr.message);

    const engine = await getSetting(supabase, "engine_attempt_default");
    const { error: pErr } = await supabase.from("agreement_proofs").insert({
      agreement_id: agr.id,
      agreement_version_id: bound.agreement_version_id,
      vai: session.vai.trim(),
      engine_used: engine,
    });
    if (pErr) throw new Error(pErr.message);

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        terms_accepted_at: new Date().toISOString(),
        acceptance_capture: capture,
        acceptance_capture_voided_at: null,
        enrolment_step: Math.max(session.enrolment_step ?? 1, 8),
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    return json({ status: "accepted", step: 8, next });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});

function json(body: Record<string, unknown>, status = 200): Response {
  const safe = stripPercentFromPublic(body);
  return new Response(JSON.stringify(safe), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
