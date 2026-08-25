import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";
import {
  generateRecoveryCode,
  hashSecret,
  maskCode,
  normalizeAnswer,
} from "../_shared/enrol-security.ts";
import { refuseUnpaid } from "../_shared/require-paid.ts";
import { getSettingNumber } from "../_shared/settings.ts";

/**
 * POST /v1/enrol/security — CANON-CP-02 §1 step 11 retrieval.
 * Counts from settings:security_question_count and settings:recovery_code_count.
 * Never a constant in this function.
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
    const action = body.action === "save" ? "save" : "options";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error } = await supabase
      .from("sessions")
      .select("id, vai, enrolment_step, contact_email, contact_phone, paid_at, platform_id")
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    const unpaidSec = refuseUnpaid(session);
    if (unpaidSec) return json(unpaidSec, 403);
    if (!session.vai) return json({ error: "vai_required_first" }, 403);
    if ((session.enrolment_step ?? 1) < 10) {
      return json({ error: "face_match_required_before_retrieval" }, 403);
    }

    const questionCount = await getSettingNumber(supabase, "security_question_count");
    const recoveryCodeCount = await getSettingNumber(supabase, "recovery_code_count");
    if (!Number.isInteger(questionCount) || questionCount < 1) {
      throw new Error("settings.security_question_count must be a positive integer");
    }
    if (!Number.isInteger(recoveryCodeCount) || recoveryCodeCount < 1) {
      throw new Error("settings.recovery_code_count must be a positive integer");
    }

    const { data: plat } = session.platform_id
      ? await supabase
          .from("platforms")
          .select("brand, display_name")
          .eq("id", session.platform_id)
          .maybeSingle()
      : { data: null };
    const brand =
      (typeof plat?.brand === "string" && plat.brand.trim()) ||
      (typeof plat?.display_name === "string" && plat.display_name.trim()) ||
      "ChainPass";

    if (action === "options") {
      const { data: options, error: oErr } = await supabase
        .from("security_question_options")
        .select("id, question_text")
        .eq("is_active", true);
      if (oErr) throw new Error(oErr.message);
      return json({
        status: "options",
        step: 11,
        brand,
        options: options ?? [],
        question_count: questionCount,
        recovery_code_count: recoveryCodeCount,
      });
    }

    const questions = Array.isArray(body.questions) ? body.questions : [];
    if (questions.length !== questionCount) {
      return json({ error: "question_count_mismatch", required: questionCount }, 400);
    }

    const rows = [];
    for (let i = 0; i < questionCount; i++) {
      const q = questions[i] as Record<string, unknown>;
      const text = typeof q.question_text === "string" ? q.question_text.trim() : "";
      const answer = typeof q.answer === "string" ? q.answer : "";
      if (!text || !answer.trim()) {
        return json({ error: "question_count_mismatch", required: questionCount }, 400);
      }
      rows.push({
        vai: session.vai.trim(),
        slot_number: i + 1,
        question_text: text,
        answer_hash: await hashSecret(normalizeAnswer(answer)),
      });
    }

    const { error: qErr } = await supabase.from("security_questions").upsert(rows, {
      onConflict: "vai,slot_number",
    });
    if (qErr) throw new Error(qErr.message);

    const codes: string[] = [];
    const codeRows = [];
    for (let i = 0; i < recoveryCodeCount; i++) {
      const code = generateRecoveryCode();
      codes.push(code);
      codeRows.push({
        vai: session.vai.trim(),
        code_hash: await hashSecret(code),
        label_mask: maskCode(code),
      });
    }
    await supabase.from("recovery_codes").delete().eq("vai", session.vai.trim());
    const { error: cErr } = await supabase.from("recovery_codes").insert(codeRows);
    if (cErr) throw new Error(cErr.message);

    const { error: uErr } = await supabase
      .from("sessions")
      .update({ enrolment_step: Math.max(session.enrolment_step ?? 1, 11) })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    return json({ status: "secured", step: 11, codes });
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
