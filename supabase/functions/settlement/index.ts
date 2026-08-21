import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import {
  markAccruedPayable,
  runSettlementJob,
  settlePayable,
} from "../_shared/settlement.ts";

/**
 * POST /v1/settlement — §16.6 step 7.
 * Body:
 *   { action: "mark_payable", platform_id? }
 *   { action: "settle", trolley_payout_ref, platform_id? }
 *   { action: "run", trolley_payout_ref, platform_id? }
 *
 * Payee on every row is trolley_recipient_id only (§14.5a items 3–4).
 * Allowlisted body keys only — no PII fields accepted.
 */
const ALLOWED_BODY_KEYS = new Set([
  "action",
  "trolley_payout_ref",
  "platform_id",
  "limit",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405);
    }

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const auth = req.headers.get("Authorization") || "";
    const bearer = auth.replace(/^Bearer\s+/i, "");
    const secretOk =
      req.headers.get("x-settlement-secret") ===
      Deno.env.get("SETTLEMENT_JOB_SECRET");
    if (bearer !== serviceKey && !secretOk) {
      return json({ error: "unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    for (const k of Object.keys(body)) {
      if (!ALLOWED_BODY_KEYS.has(k)) {
        return json(
          {
            error: "unknown_field_rejected",
            message:
              "Settlement body allowlist only; payee is trolley_recipient_id (§14.5a).",
          },
          400
        );
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const platform_id =
      typeof body.platform_id === "string" ? body.platform_id : undefined;
    const action = body.action;

    if (action === "mark_payable") {
      const result = await markAccruedPayable(supabase, { platform_id });
      return json({ status: "payable", ...result });
    }

    if (action === "settle") {
      const trolley_payout_ref =
        typeof body.trolley_payout_ref === "string"
          ? body.trolley_payout_ref
          : "";
      if (!trolley_payout_ref) {
        return json({ error: "trolley_payout_ref required" }, 400);
      }
      const result = await settlePayable(supabase, {
        trolley_payout_ref,
        platform_id,
      });
      return json({ status: "settled", ...result });
    }

    if (action === "run") {
      const trolley_payout_ref =
        typeof body.trolley_payout_ref === "string"
          ? body.trolley_payout_ref
          : "";
      if (!trolley_payout_ref) {
        return json({ error: "trolley_payout_ref required" }, 400);
      }
      const result = await runSettlementJob(supabase, {
        trolley_payout_ref,
        platform_id,
      });
      return json({ status: "settlement_complete", ...result });
    }

    return json({ error: "action must be mark_payable|settle|run" }, 400);
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
