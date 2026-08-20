import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { compareCaptureToBaseline } from "../_shared/band-compare.ts";
import { renewalPath } from "../_shared/renewal-path.ts";
import {
  advanceCredentialYearFromVerification,
  appendRenewalBaseline,
  accrueRenewalCommission,
  resolveSessionKeyDedup,
} from "../_shared/renewal-ops.ts";
import { publicGateBody } from "../_shared/gate-response.ts";

/**
 * Renewal (§10.1–10.4 / §16.4 / §2.4b):
 * Two-date test → in_house | full_verification_required.
 * Both paths accrue renewal commission to originator.
 * Year advances from verified_at — payment never moves it.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const vai = typeof body.vai === "string" ? body.vai.trim().toUpperCase() : "";
    const capture = typeof body.capture === "string" ? body.capture : null;
    const provider_session_key =
      typeof body.provider_session_key === "string" ? body.provider_session_key : null;
    const fresh_vector = Array.isArray(body.vector) ? body.vector : null;

    if (!vai) {
      return json({ error: "Missing required field: vai" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: credential, error: credentialError } = await supabase
      .from("credentials")
      .select("vai, state, document_expiry, next_complycube_date")
      .eq("vai", vai)
      .single();

    if (credentialError || !credential) {
      return json({ error: "Credential not found" }, 404);
    }

    if (credential.state === "suspended" || credential.state === "banned") {
      return json({ error: `Credential is ${credential.state}. Cannot renew.` }, 400);
    }

    const path = renewalPath(
      credential.document_expiry,
      credential.next_complycube_date
    );

    if (path === "full_verification_required") {
      // Fresh provider run: append baseline; dedup session key; commission.
      if (provider_session_key) {
        const dedup = await resolveSessionKeyDedup(
          supabase,
          vai,
          provider_session_key
        );
        if (fresh_vector && fresh_vector.length === 512) {
          await appendRenewalBaseline(supabase, {
            vai,
            vector: fresh_vector,
            model: typeof body.model === "string" ? body.model : "standard",
            model_version:
              typeof body.model_version === "string" ? body.model_version : "1",
          });
        }
        const verified_at = new Date();
        await advanceCredentialYearFromVerification(supabase, vai, verified_at);
        await accrueRenewalCommission(supabase, vai);
        return json({
          vai,
          path: "full_verification_required",
          session_key: dedup.session_key,
          year_starts_at: verified_at.toISOString(),
        });
      }
      return json({ vai, path: "full_verification_required" });
    }

    // in_house
    if (!capture) {
      return json({ vai, path: "in_house", action: "capture_required" });
    }

    const { band } = await compareCaptureToBaseline(supabase, vai, capture);

    if (band === "green") {
      const verified_at = new Date();
      await advanceCredentialYearFromVerification(supabase, vai, verified_at);
      await accrueRenewalCommission(supabase, vai);
      return json({
        vai,
        path: "in_house",
        band,
        year_starts_at: verified_at.toISOString(),
      });
    }

    return json({ vai, path: "in_house", band });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      500
    );
  }
});

function json(body: Record<string, unknown>, status = 200): Response {
  // Strip accidental percentages if band present
  if ("band" in body) {
    try {
      body = publicGateBody(body);
    } catch {
      /* proof paths may include other fields */
    }
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
