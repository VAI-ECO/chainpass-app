import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { refusePlatformQuery } from "../_shared/refuse-platform-query.ts";
import { refuseUnpaid } from "../_shared/require-paid.ts";
import { getSetting, refuseUnset } from "../_shared/settings.ts";
import { requireComplyCubeApiKey } from "../_shared/enrol-capture.ts";
import {
  extractKycSupplierIdentity,
  fetchLatestKycCheck,
} from "../_shared/kyc-document.ts";
import {
  callOffendersIo,
  requireOffendersService,
} from "../_shared/enrol-background.ts";

/**
 * POST /v1/enrol/background — §4.
 * Session open, frame one held, V.A.I. not yet minted.
 * Binary back. Nothing stored. Unavailable is technical.
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error } = await supabase
      .from("sessions")
      .select(
        "id, platform_id, vai, enrolment_step, held_capture, provider_session_key, background_check_at, paid_at"
      )
      .eq("id", session_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!session) return json({ error: "session_not_found" }, 404);
    const unpaidBg = refuseUnpaid(session);
    if (unpaidBg) return json(unpaidBg, 403);
    if (session.vai) return json({ error: "vai_already_minted" }, 403);
    if (!session.held_capture) {
      return json({ error: "held_capture_required" }, 409);
    }

    const { data: required } = await supabase
      .from("platform_requirements")
      .select("requirement_key")
      .eq("platform_id", session.platform_id)
      .eq("requirement_key", "background_check")
      .maybeSingle();
    if (!required) {
      return json({ status: "not_required", check_did_not_run: true });
    }

    const cost = await getSetting(supabase, "background_check_cost") ?? refuseUnset("background_check_cost");

    const { data: supplier } = await supabase
      .from("service_registry")
      .select("status")
      .eq("service_id", "offenders_io")
      .maybeSingle();
    if (!supplier || supplier.status !== "active") {
      return json(
        {
          status: "unavailable",
          check_did_not_run: true,
          cost_setting: "settings:background_check_cost",
          cost,
        },
        503
      );
    }

    let face: { url: string; key: string };
    try {
      face = requireOffendersService();
    } catch (e) {
      return json(
        {
          status: "unavailable",
          check_did_not_run: true,
          error: e instanceof Error ? e.message : "OFFENDERS_IO missing",
        },
        503
      );
    }

    const clientId =
      typeof session.provider_session_key === "string"
        ? session.provider_session_key.trim()
        : "";
    if (!clientId) {
      return json({ error: "supplier_identity_missing" }, 409);
    }

    let identity: ReturnType<typeof extractKycSupplierIdentity>;
    try {
      const check = await fetchLatestKycCheck(clientId, requireComplyCubeApiKey());
      identity = extractKycSupplierIdentity(check);
    } catch (e) {
      return json(
        { error: e instanceof Error ? e.message : "supplier_identity_missing" },
        409
      );
    }

    const outcome = await callOffendersIo(face, identity);
    if (outcome === "unavailable") {
      return json(
        {
          status: "unavailable",
          check_did_not_run: true,
          cost_setting: "settings:background_check_cost",
        },
        503
      );
    }

    const { error: uErr } = await supabase
      .from("sessions")
      .update({
        background_check_at: new Date().toISOString(),
      })
      .eq("id", session_id);
    if (uErr) throw new Error(uErr.message);

    return json({
      status: "checked",
      result: outcome,
      check_did_not_run: false,
      cost_setting: "settings:background_check_cost",
      cost,
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
