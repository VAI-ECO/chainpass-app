import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * GET /v1/service-state — RULINGS-CP-05 §5.
 * Public to platforms. Names which subsystem is down. Never says why.
 * UNKNOWN (no probe yet) is served as down.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data, error } = await supabase
      .from("service_state")
      .select("subsystem, mode, served_as, last_probe_at")
      .in("subsystem", ["matcher", "image_serve"]);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const matcher = rows.find((r) => r.subsystem === "matcher");
    const image = rows.find((r) => r.subsystem === "image_serve");
    const matcherDown = !matcher || matcher.served_as !== "up" || !matcher.last_probe_at;
    const imageDown = !image || image.served_as !== "up" || !image.last_probe_at;
    const down: string[] = [];
    if (matcherDown) down.push("matcher");
    if (imageDown) down.push("image_serve");
    return json({
      matcher: matcherDown ? "down" : "up",
      image_serve: imageDown ? "down" : "up",
      down,
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
