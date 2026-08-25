import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * SN-44 — master settings. List keys (no figures invented). Save writes settings_audit.
 * Body: { action: "list" | "set", key?, value?, actor? }
 * Values come from the row. Never fall back to a constant.
 */
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const GROUP_OF: Record<string, string> = {
  band_green_min: "Bands",
  band_yellow_min: "Bands",
  attempt_count_n: "Attempts",
  engine_attempt_default: "Attempts",
  engine_attempt_last: "Attempts",
  reds_threshold: "Attempts",
  price_vai: "Prices",
  price_vai_pro: "Prices",
  price_access: "Prices",
  background_check_cost: "Prices",
  dash_face_seat_1: "Prices",
  dash_face_seat_pack: "Prices",
  dash_face_seat_10: "Prices",
  dash_face_seat_over_10: "Prices",
  deferral_window_hours: "Windows",
  deferral_suspend_after: "Windows",
  agreement_open_hours: "Windows",
  renewal_window: "Windows",
  handoff_poll_window: "Windows",
  handback_nonce_ttl: "Windows",
  enrol_session_hours: "Windows",
  facial_signature_max_recent: "Windows",
  facial_attempt_window_minutes: "Windows",
  facial_signature_window_minutes: "Windows",
  payout_cadence: "Windows",
  credential_year_length_years: "Retention",
  provider_retention_years: "Retention",
  consumption_block_size: "Blocks",
  blocks_alert_threshold: "Blocks",
  blocks_burn_window_hours: "Blocks",
  commission_origination_rate: "Commission",
  commission_renewal_rate: "Commission",
  commission_cap: "Commission",
  security_question_count: "Recovery",
  recovery_code_count: "Recovery",
  recovery_otp_max_attempts: "Recovery",
  enrol_otp_accept: "Recovery",
  appeal_panel_size: "Panels",
  platform_document_pack: "Platform",
  provider_active: "Platform",
};

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
        .from("settings")
        .select("key, value, updated_at")
        .order("key");
      if (error) throw new Error(error.message);
      const rows = (data ?? []).map((r: { key: string; value: string; updated_at: string }) => ({
        key: r.key,
        group: GROUP_OF[r.key] ?? "Other",
        // Value is returned for the editor only — member copy never prints it.
        value: r.value,
        updated_at: r.updated_at,
        scope: "Global",
      }));
      return json({ status: "ok", settings: rows });
    }

    if (action === "set") {
      const key = typeof body.key === "string" ? body.key.trim() : "";
      const value = typeof body.value === "string" ? body.value.trim() : "";
      const actor =
        typeof body.actor === "string" && body.actor.trim()
          ? body.actor.trim()
          : "master";
      if (!key) return json({ error: "key required" }, 400);
      if (!value) return json({ error: "value required" }, 400);

      const { data: existing, error: eErr } = await supabase
        .from("settings")
        .select("key, value")
        .eq("key", key)
        .maybeSingle();
      if (eErr) throw new Error(eErr.message);
      if (!existing) return json({ error: "unknown_key" }, 404);

      const old_value = existing.value as string;
      if (old_value === value) {
        return json({
          status: "unchanged",
          key,
          value,
          audit: "skipped",
        });
      }

      const { error: uErr } = await supabase
        .from("settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);
      if (uErr) throw new Error(uErr.message);

      const { error: aErr } = await supabase.from("settings_audit").insert({
        setting_key: key,
        old_value,
        new_value: value,
        actor,
      });
      if (aErr) throw new Error(aErr.message);

      return json({
        status: "saved",
        key,
        value,
        audit: {
          entry: "settings_audit",
          actor,
          before: old_value,
          after: value,
        },
      });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, 500);
  }
});
