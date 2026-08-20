import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { extractApiKey, resolvePlatformByApiKey } from "../_shared/platform-key.ts";

/**
 * Service registry / inbound bank (§14.4).
 * POST elect platform_services · GET list registry · PATCH status (never delete).
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

    const url = new URL(req.url);
    const isHealth = url.pathname.endsWith("/health") || url.searchParams.get("health") === "1";

    if (isHealth || (req.method === "GET" && url.pathname.includes("health"))) {
      // Health: which subsystem is down — image serve separate from matcher
      const { data: rows } = await supabase
        .from("service_registry")
        .select("service_id, status")
        .in("service_id", ["face_matcher", "face_image"]);

      const byId = Object.fromEntries((rows ?? []).map((r) => [r.service_id, r.status]));
      const matcher = byId["face_matcher"] ?? "missing";
      const image = byId["face_image"] ?? "missing";
      const down: string[] = [];
      if (matcher !== "active") down.push("face_matcher");
      if (image !== "active") down.push("face_image");

      return new Response(
        JSON.stringify({
          status: down.length === 0 ? "ok" : "degraded",
          face_matcher: matcher,
          face_image: image,
          down,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = extractApiKey(req);
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "missing_api_key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const platform = await resolvePlatformByApiKey(supabase, apiKey);

    if (req.method === "GET") {
      const { data: registry } = await supabase
        .from("service_registry")
        .select("service_id, name, adapter, status");
      const { data: elected } = await supabase
        .from("platform_services")
        .select("service_id")
        .eq("platform_id", platform.id);
      return new Response(
        JSON.stringify({ registry, elected: (elected ?? []).map((e) => e.service_id) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST") {
      // Elect services at onboarding
      const body = await req.json().catch(() => ({}));
      const services: string[] = Array.isArray(body.services) ? body.services : [];
      for (const service_id of services) {
        const { error } = await supabase.from("platform_services").upsert({
          platform_id: platform.id,
          service_id,
        });
        if (error) throw new Error(error.message);
      }
      return new Response(JSON.stringify({ status: "elected", services }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "PATCH") {
      // Remove = status change, never delete
      const body = await req.json().catch(() => ({}));
      const service_id = typeof body.service_id === "string" ? body.service_id : "";
      const status = body.status === "disabled" ? "disabled" : "active";
      if (!service_id) {
        return new Response(JSON.stringify({ error: "service_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase
        .from("service_registry")
        .update({ status })
        .eq("service_id", service_id);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ status: "updated", service_id, new_status: status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
