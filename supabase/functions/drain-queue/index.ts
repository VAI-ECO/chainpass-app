import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { createComplyCubeFlowSession } from "../_shared/complycube-session.ts";
import { emitEvent } from "../_shared/emit-event.ts";

/**
 * Drain queued sessions: attempt to reopen sessions blocked by ComplyCube unavailability
 *
 * NO N-ATTEMPT LIMIT: Re-verification is the only way out of lockout, so we never give up.
 * Sessions remain queued until ComplyCube becomes available.
 *
 * Scheduled to run every 15 minutes via pg_cron
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[Drain Queue] Starting queued session processing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 1: Find all queued sessions
    const { data: queuedSessions, error: queryError } = await supabase
      .from("sessions")
      .select("*")
      .eq("state", "queued")
      .order("created_at", { ascending: true }); // FIFO: oldest first

    if (queryError) {
      throw new Error(`Failed to query queued sessions: ${queryError.message}`);
    }

    if (!queuedSessions || queuedSessions.length === 0) {
      console.log("[Drain Queue] No queued sessions found");
      return new Response(
        JSON.stringify({ message: "No queued sessions", processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Drain Queue] Found ${queuedSessions.length} queued session(s)`);

    let reopened = 0;
    let stillQueued = 0;

    // Step 2: Process each queued session
    for (const session of queuedSessions) {
      console.log(`[Drain Queue] Processing session ${session.id}, route=${session.route}, vai=${session.vai || "none"}`);

      try {
        // Load credential (needed for complycube_client_id)
        let complycubeClientId: string;

        if (session.vai) {
          // Session has VAI (rebaseline, unlock, renewal)
          const { data: credential, error: credentialError } = await supabase
            .from("credentials")
            .select("complycube_client_id")
            .eq("vai", session.vai)
            .single();

          if (credentialError || !credential) {
            console.error(`[Drain Queue] Credential not found for VAI ${session.vai}, skipping session ${session.id}`);
            continue;
          }

          complycubeClientId = credential.complycube_client_id;
        } else {
          // Enrollment session (no VAI yet) - this shouldn't happen in normal flow
          // but handle it gracefully
          console.error(`[Drain Queue] Session ${session.id} has no VAI and no credential. Cannot process.`);
          continue;
        }

        // Attempt to create ComplyCube flow session
        const result = await createComplyCubeFlowSession(
          supabase,
          session.id,
          complycubeClientId
        );

        // Success! Session has been moved to state='at_provider' by createComplyCubeFlowSession
        console.log(`[Drain Queue] Session ${session.id} reopened: ${result.redirect_url}`);
        reopened++;

        // Emit session.ready event
        await emitEvent(supabase, session.vai!, "session.ready", {
          session_id: session.id,
          route: session.route,
          redirect_url: result.redirect_url,
        });

        console.log(`[Drain Queue] session.ready event emitted for VAI ${session.vai}`);

      } catch (error) {
        // Check if it's still a QUEUED error (ComplyCube still unavailable)
        if (error instanceof Error && error.message.startsWith("QUEUED:")) {
          console.log(`[Drain Queue] Session ${session.id} still queued: ${error.message}`);
          stillQueued++;
          // Session remains in state='queued', will retry next run
        } else {
          // Unexpected error - log but don't fail entire batch
          console.error(`[Drain Queue] Error processing session ${session.id}:`, error);
          stillQueued++;
        }
      }
    }

    console.log(`[Drain Queue] Complete: ${reopened} reopened, ${stillQueued} still queued`);

    return new Response(
      JSON.stringify({
        message: "Queue drain complete",
        processed: queuedSessions.length,
        reopened,
        stillQueued,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Drain Queue] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
