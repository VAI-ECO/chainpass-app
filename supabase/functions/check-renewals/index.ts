import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { emitEvent } from "../_shared/emit-event.ts";
import { getSettingNumber, refuseUnset } from "../_shared/settings.ts";
import { suspendExpiredDeferrals } from "../_shared/deferral-suspend.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[check-renewals] Starting renewal check");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const deferralsSuspended = await suspendExpiredDeferrals(supabase);

    const today = new Date();

    // Query all credentials that are NOT suspended or banned
    // Suspended and banned override expiry - do not touch them
    const { data: credentials, error: credentialsError } = await supabase
      .from("credentials")
      .select("*")
      .not("state", "in", "(suspended,banned)");

    if (credentialsError) {
      console.error("[check-renewals] Error fetching credentials:", credentialsError);
      throw credentialsError;
    }

    if (!credentials || credentials.length === 0) {
      console.log("[check-renewals] No credentials to process");
      return new Response(
        JSON.stringify({
          processed: 0,
          expiring_emitted: 0,
          expired_set: 0,
          document_expired_emitted: 0,
          deferrals_suspended: deferralsSuspended,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[check-renewals] Processing ${credentials.length} credentials`);

    const renewalWindowDays = await getSettingNumber(supabase, "renewal_window") ?? refuseUnset("renewal_window");
    const termYears = await getSettingNumber(supabase, "credential_year_length_years") ?? refuseUnset("credential_year_length_years");

    let expiringEmitted = 0;
    let expiredSet = 0;
    let documentExpiredEmitted = 0;

    for (const credential of credentials) {
      const vai = credential.vai;
      const renewalDate = new Date(credential.next_renewal_date);
      const documentExpiryDate = new Date(credential.document_expiry);

      // Cycle start = term length before next renewal (never a hardcoded year).
      const renewalCycleStart = new Date(renewalDate);
      renewalCycleStart.setFullYear(
        renewalCycleStart.getFullYear() - termYears
      );

      // CONDITION A: Renewal approaching (within settings:renewal_window days)
      const daysUntilRenewal = Math.floor((renewalDate.getTime() - today.getTime()) / DAY_MS);

      if (daysUntilRenewal >= 0 && daysUntilRenewal <= renewalWindowDays) {
        // Check if we've already emitted credential.expiring for this renewal cycle
        const { data: existingEvents, error: eventsError } = await supabase
          .from("credential_events")
          .select("id")
          .eq("vai", vai)
          .eq("type", "credential.expiring")
          .gte("created_at", renewalCycleStart.toISOString())
          .limit(1);

        if (eventsError) {
          console.error(`[check-renewals] Error checking expiring events for ${vai}:`, eventsError);
          continue;
        }

        if (!existingEvents || existingEvents.length === 0) {
          console.log(`[check-renewals] Emitting credential.expiring for ${vai} (${daysUntilRenewal} days)`);
          await emitEvent(supabase, vai, "credential.expiring", {
            days_until_renewal: daysUntilRenewal,
            next_renewal_date: credential.next_renewal_date,
          });
          expiringEmitted++;
        }
      }

      // CONDITION B: Renewal date has passed
      if (today > renewalDate) {
        console.log(`[check-renewals] Setting ${vai} to expired (renewal date passed)`);

        // Set state to 'expired' and emit event
        const { error: updateError } = await supabase
          .from("credentials")
          .update({
            state: "expired",
            state_changed_at: today.toISOString(),
          })
          .eq("vai", vai);

        if (updateError) {
          console.error(`[check-renewals] Error updating ${vai} to expired:`, updateError);
          continue;
        }

        await emitEvent(supabase, vai, "credential.expired", {
          next_renewal_date: credential.next_renewal_date,
        });
        expiredSet++;
      }

      // CONDITION C: Document expired but credential still valid
      if (today > documentExpiryDate && today <= renewalDate) {
        // Check if we've already emitted document.expired for this cycle
        const { data: existingDocEvents, error: docEventsError } = await supabase
          .from("credential_events")
          .select("id")
          .eq("vai", vai)
          .eq("type", "document.expired")
          .gte("created_at", renewalCycleStart.toISOString())
          .limit(1);

        if (docEventsError) {
          console.error(`[check-renewals] Error checking document.expired events for ${vai}:`, docEventsError);
          continue;
        }

        if (!existingDocEvents || existingDocEvents.length === 0) {
          console.log(`[check-renewals] Emitting document.expired for ${vai}`);
          await emitEvent(supabase, vai, "document.expired", {
            document_expiry: credential.document_expiry,
            next_renewal_date: credential.next_renewal_date,
          });
          documentExpiredEmitted++;
        }
      }
    }

    console.log(
      `[check-renewals] Complete: processed=${credentials.length}, ` +
      `expiring=${expiringEmitted}, expired=${expiredSet}, doc_expired=${documentExpiredEmitted}`
    );

    return new Response(
      JSON.stringify({
        processed: credentials.length,
        expiring_emitted: expiringEmitted,
        expired_set: expiredSet,
        document_expired_emitted: documentExpiredEmitted,
        deferrals_suspended: deferralsSuspended,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[check-renewals] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
