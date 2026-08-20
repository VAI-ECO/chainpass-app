import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { emitEvent } from "../_shared/emit-event.ts";
import { drainQueuedSessionAction } from "../_shared/drain-action.ts";

/**
 * Drain queued sessions by V.A.I.
 *
 * Silent provider reopen via stored client ID is removed (§2.4 patent gate).
 * A queue item that previously depended on that fetch cannot complete without
 * the person live at a camera — it fails to state=failed for ChainPass admin.
 * Nothing about a person is pulled from a provider here.
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

    const { data: queuedSessions, error: queryError } = await supabase
      .from("sessions")
      .select("*")
      .eq("state", "queued")
      .order("created_at", { ascending: true });

    if (queryError) {
      throw new Error(`Failed to query queued sessions: ${queryError.message}`);
    }

    if (!queuedSessions || queuedSessions.length === 0) {
      console.log("[Drain Queue] No queued sessions found");
      return new Response(
        JSON.stringify({ message: "No queued sessions", processed: 0, failed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Drain Queue] Found ${queuedSessions.length} queued session(s)`);

    let failed = 0;

    for (const session of queuedSessions) {
      console.log(
        `[Drain Queue] Processing session ${session.id}, route=${session.route}, vai=${session.vai || "none"}`
      );

      const action = drainQueuedSessionAction(session.vai);
      if (action !== "failed_needs_live_camera") {
        continue;
      }

      const { error: updateError } = await supabase
        .from("sessions")
        .update({ state: "failed" })
        .eq("id", session.id);

      if (updateError) {
        console.error(`[Drain Queue] Failed to mark session ${session.id}:`, updateError);
        continue;
      }

      failed++;

      if (session.vai) {
        await emitEvent(supabase, session.vai, "session.failed", {
          session_id: session.id,
          route: session.route,
          reason: "needs_live_camera",
          detail:
            "Queued provider reopen without a live camera is forbidden. Member must attend.",
        });
      }

      console.log(
        `[Drain Queue] Session ${session.id} → failed (admin-visible; no provider fetch)`
      );
    }

    console.log(`[Drain Queue] Complete: ${failed} failed to admin-visible status`);

    return new Response(
      JSON.stringify({
        message: "Queue drain complete",
        processed: queuedSessions.length,
        failed,
        reopened: 0,
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
