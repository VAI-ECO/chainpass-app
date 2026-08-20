import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * GET /v1/health — one endpoint naming which facial subsystem is down.
 * Image serve is separate from matcher (§14.4 / §16.6 step 9 item 5).
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: rows } = await supabase
    .from("service_registry")
    .select("service_id, status")
    .in("service_id", ["face_matcher", "face_image", "complycube", "trolley"]);

  const byId = Object.fromEntries((rows ?? []).map((r) => [r.service_id, r.status]));
  const down = Object.entries(byId)
    .filter(([, s]) => s !== "active")
    .map(([id]) => id);

  // Photograph serve vs matcher called out explicitly
  return new Response(
    JSON.stringify({
      status: down.length === 0 ? "ok" : "degraded",
      subsystems: byId,
      down,
      face_image_serves_when_matcher_down:
        byId["face_image"] === "active" && byId["face_matcher"] !== "active",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
