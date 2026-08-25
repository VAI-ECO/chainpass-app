import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { extractApiKey, resolvePlatformByApiKey } from "../_shared/platform-key.ts";
import { getSetting } from "../_shared/settings.ts";
import { signEnrolmentToken } from "../_shared/enrolment-token.ts";

/**
 * POST /v1/rebaseline-request — RULINGS-CP-06.
 * Opens a session. Never performs the act.
 * Response: token and URL and nothing else. No user state.
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
    const body = await req.json().catch(() => ({}));
    const vai = typeof body.vai === "string" ? body.vai.trim().toUpperCase() : "";
    if (!/^[A-Z0-9]{7}$/.test(vai)) return json({ error: "refused" }, 403);

    const { data: held } = await supabase
      .from("platform_visits")
      .select("vai")
      .eq("vai", vai)
      .eq("platform_id", platform.id)
      .maybeSingle();
    if (!held) return json({ error: "refused" }, 403);

    const { data: cred } = await supabase
      .from("credentials")
      .select("vai, state, rebaseline_count")
      .eq("vai", vai)
      .maybeSingle();
    if (!cred) return json({ error: "refused" }, 403);
    if (cred.state === "locked" || cred.state === "suspended" || cred.state === "banned") {
      return json({ error: "refused" }, 403);
    }

    const capRaw = await getSetting(supabase, "rebaseline_cap_per_period");
    if (capRaw !== "UNSET") {
      const cap = Number(capRaw);
      if (!Number.isNaN(cap) && (cred.rebaseline_count ?? 0) >= cap) {
        return json({ error: "refused" }, 403);
      }
    }

    const token = await signEnrolmentToken(platform.id);
    const url = `${new URL(req.url).origin}/enrol/capture?rebaseline=1`;
    return json({ token, url });
  } catch {
    return json({ error: "refused" }, 403);
  }
});

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
