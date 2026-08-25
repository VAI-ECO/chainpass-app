import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { parseResponseLevel } from "../_shared/response-level.ts";

/**
 * SN-42 — platforms as rows. Set response_level. No code change on the platform side.
 */
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    const body = await req.json().catch(() => ({}));
    const action = typeof body.action === "string" ? body.action : "list";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "list") {
      const { data, error } = await supabase
        .from("platforms")
        .select("id, display_name, response_level, service_level, status")
        .order("id");
      if (error) throw new Error(error.message);
      return json({ status: "ok", platforms: data ?? [] });
    }

    if (action === "set_response_level") {
      const id = typeof body.id === "string" ? body.id.trim() : "";
      const response_level = parseResponseLevel(body.response_level);
      if (!id) return json({ error: "id required" }, 400);
      const { data, error } = await supabase
        .from("platforms")
        .update({ response_level })
        .eq("id", id)
        .select("id, response_level")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return json({ error: "platform_not_found" }, 404);
      return json({ status: "saved", platform: data });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});
