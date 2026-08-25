import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";

/**
 * POST /v1/enrol/requirements — §2 step 9 (Pro only).
 * quote_only: list platform requirements vs on-file (SN-10).
 * law_enforcement_declared: LE is a declaration, never an agreement_versions subtype (SN-11).
 * complete: mark step 9 after outstanding items are done (SN-12 follows sign-contract).
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
    if (body.terms_doc_ref !== undefined) {
      return json({ error: "terms_doc_ref_rejected" }, 400);
    }
    if (
      body.subtype === "le_declaration" ||
      body.subtype === "le" ||
      body.agreement_subtype === "le_declaration"
    ) {
      return json({ error: "le_is_declaration_not_agreement_subtype" }, 400);
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
    if ((session.enrolment_step ?? 1) < 8) {
      return json({ error: "enrolment_step_order: acceptance at 8 before requirements at 9" }, 403);
    }

    const vai = session.vai.trim();

    const { data: platformReqs, error: prErr } = await supabase
      .from("platform_requirements")
      .select("requirement_key, sort_order")
      .eq("platform_id", session.platform_id)
      .order("sort_order", { ascending: true });
    if (prErr) throw new Error(prErr.message);

    const keys = (platformReqs ?? []).map((r) => r.requirement_key);
    const { data: catalog } = await supabase
      .from("requirements")
      .select("key, display_name, kind");
    const catalogByKey = new Map(
      (catalog ?? []).map((r) => [r.key, r] as const)
    );

    const { data: completions } = await supabase
      .from("requirement_completions")
      .select("requirement_key")
      .eq("vai", vai);
    const onFile = new Set((completions ?? []).map((c) => c.requirement_key));

    const items = keys.map((key) => {
      const meta = catalogByKey.get(key);
      return {
        key,
        display_name: meta?.display_name ?? key,
        kind: meta?.kind ?? "check",
        on_file: onFile.has(key),
      };
    });

    if (body.quote_only === true) {
      return json({
        status: "requirements_quote",
        step: 9,
        items,
        le_required: keys.includes("le_declaration") && !onFile.has("le_declaration"),
        signature_required:
          keys.includes("signature_agreement") && !onFile.has("signature_agreement"),
      });
    }

    if (body.law_enforcement_declared === true) {
      if (keys.length > 0 && !keys.includes("le_declaration")) {
        return json({ error: "le_declaration_not_required_by_platform" }, 400);
      }
      const { data: ver } = await supabase
        .from("requirement_versions")
        .select("version, body, effective_from")
        .eq("requirement_key", "le_declaration")
        .lte("effective_from", new Date().toISOString().slice(0, 10))
        .order("effective_from", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { error: cErr } = await supabase.from("requirement_completions").insert({
        vai,
        requirement_key: "le_declaration",
        platform_id: session.platform_id,
        signed_version: ver?.version ?? "declaration",
        signed_at: new Date().toISOString(),
        affirmation_version: ver?.version ?? "",
      });
      if (cErr) throw new Error(cErr.message);

      return json({
        status: "le_declared",
        step: 9,
        law_enforcement_declared: true,
        version: ver?.version ?? null,
        body: ver?.body ?? null,
      });
    }

    if (body.quote_declaration === true) {
      const { data: ver } = await supabase
        .from("requirement_versions")
        .select("version, body, effective_from")
        .eq("requirement_key", "le_declaration")
        .lte("effective_from", new Date().toISOString().slice(0, 10))
        .order("effective_from", { ascending: false })
        .limit(1)
        .maybeSingle();
      return json({
        status: "le_quote",
        step: 9,
        required: keys.includes("le_declaration") && !onFile.has("le_declaration"),
        version: ver?.version ?? null,
        effective_from: ver?.effective_from ?? null,
        body: ver?.body ?? null,
        kind: "declaration",
      });
    }

    if (body.complete === true) {
      const { error: uErr } = await supabase
        .from("sessions")
        .update({
          requirements_signed_at: new Date().toISOString(),
          enrolment_step: Math.max(session.enrolment_step, 9),
        })
        .eq("id", session_id);
      if (uErr) throw new Error(uErr.message);
      return json({ status: "requirements_signed", step: 9, versions_stamped: 0 });
    }

    const version_ids = Array.isArray(body.version_ids)
      ? body.version_ids.filter((v: unknown) => typeof v === "string" && v.trim())
      : [];
    if (version_ids.length === 0) {
      return json(
        { error: "quote_only, law_enforcement_declared, complete, or version_ids required" },
        400
      );
    }

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
      if (ver.subtype === "le_declaration" || ver.subtype === "le") {
        return json({ error: "le_is_declaration_not_agreement_subtype" }, 400);
      }

      const { data: agr, error: aErr } = await supabase
        .from("agreements")
        .insert({
          platform_id: session.platform_id,
          type: "single",
          subtype: ver.subtype === "terms" ? "terms" : "contract",
          vai_1: vai,
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
        vai,
        engine_used: "enrolment_step_9",
      });
      if (pErr) throw new Error(pErr.message);
    }

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        requirements_signed_at: new Date().toISOString(),
        enrolment_step: Math.max(session.enrolment_step, 9),
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    return json({
      status: "requirements_signed",
      step: 9,
      versions_stamped: version_ids.length,
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
