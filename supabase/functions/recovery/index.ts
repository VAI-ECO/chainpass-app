import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { extractApiKey, resolvePlatformByApiKey } from "../_shared/platform-key.ts";
import { hashSecret, normalizeAnswer } from "../_shared/enrol-security.ts";
import { getSettingNumber } from "../_shared/settings.ts";

/**
 * POST /v1/recovery — §14.6 surface 9.
 * Actions: set_questions · verify_answer · burn_otp · lock_state.
 * Scoped to the platform API key. The session key is not an endpoint.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    const apiKey = extractApiKey(req);
    if (!apiKey) return json({ error: "missing_api_key" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const platform = await resolvePlatformByApiKey(supabase, apiKey);
    if (platform.status === "suspended" || platform.status === "disabled") {
      return json({ error: `platform is ${platform.status}` }, 403);
    }

    const body = await req.json().catch(() => ({}));
    if (body.session_key !== undefined) {
      return json({ error: "session_key_not_an_endpoint" }, 404);
    }
    const vai = typeof body.vai === "string" ? body.vai.trim() : "";
    if (!vai) return json({ error: "vai required" }, 400);
    const action = typeof body.action === "string" ? body.action : "";

    const allowed = await platformMayTouchVai(supabase, platform.id, vai);
    if (!allowed) return json({ error: "not_this_platform" }, 403);

    if (action === "lock_state") {
      const { data } = await supabase
        .from("security_question_lockouts")
        .select("vai, locked, failed_attempts, locked_at")
        .eq("vai", vai)
        .maybeSingle();
      return json({
        action: "lock_state",
        locked: data?.locked === true,
        failed_attempts: data?.failed_attempts ?? 0,
        locked_at: data?.locked_at ?? null,
      });
    }

    if (action === "set_questions") {
      const questions = Array.isArray(body.questions) ? body.questions : [];
      const required = await getSettingNumber(supabase, "security_question_count");
      if (questions.length !== required) {
        return json({ error: "question_count_mismatch", required }, 400);
      }
      await supabase.from("security_questions").delete().eq("vai", vai);
      const rows = [];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i] as Record<string, unknown>;
        const prompt =
          typeof q.question === "string"
            ? q.question
            : typeof q.question_text === "string"
              ? q.question_text
              : "";
        const answer = typeof q.answer === "string" ? q.answer : "";
        if (!prompt || !answer) return json({ error: "question_and_answer_required" }, 400);
        rows.push({
          vai,
          slot_number: i + 1,
          question_text: prompt,
          answer_hash: await hashSecret(normalizeAnswer(answer)),
        });
      }
      const { error } = await supabase.from("security_questions").upsert(rows, {
        onConflict: "vai,slot_number",
      });
      if (error) throw new Error(error.message);
      return json({ action: "set_questions", status: "saved" });
    }

    if (action === "verify_answer") {
      const prompt = typeof body.question === "string" ? body.question : "";
      const answer = typeof body.answer === "string" ? body.answer : "";
      if (!prompt || !answer) return json({ error: "question_and_answer_required" }, 400);
      const { data: row } = await supabase
        .from("security_questions")
        .select("answer_hash")
        .eq("vai", vai)
        .eq("question_text", prompt)
        .maybeSingle();
      if (!row) return json({ result: "no_match" }, 403);
      const ok = row.answer_hash === (await hashSecret(normalizeAnswer(answer)));
      return json({ result: ok ? "match" : "no_match" });
    }

    if (action === "burn_otp") {
      const code = typeof body.code === "string" ? body.code.trim() : "";
      if (!code) return json({ error: "code required" }, 400);
      const { data: rows } = await supabase
        .from("recovery_codes")
        .select("id, code_hash, spent_at")
        .eq("vai", vai)
        .is("spent_at", null);
      const hashed = await hashSecret(code);
      const found = (rows ?? []).find((r) => r.code_hash === hashed);
      if (!found) return json({ result: "no_match" }, 403);
      const { error } = await supabase
        .from("recovery_codes")
        .update({ spent_at: new Date().toISOString() })
        .eq("id", found.id);
      if (error) throw new Error(error.message);
      return json({ result: "burned" });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});

async function platformMayTouchVai(
  supabase: ReturnType<typeof createClient>,
  platform_id: string,
  vai: string
): Promise<boolean> {
  const { data: cred } = await supabase
    .from("credentials")
    .select("originating_platform_id")
    .eq("vai", vai)
    .maybeSingle();
  if (cred?.originating_platform_id === platform_id) return true;
  const { data: visit } = await supabase
    .from("platform_visits")
    .select("vai")
    .eq("vai", vai)
    .eq("platform_id", platform_id)
    .maybeSingle();
  return !!visit;
}

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
