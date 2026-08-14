import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { determineRenewalFrame } from "../_shared/renewal-decision.ts";
import { createComplyCubeFlowSession } from "../_shared/complycube-session.ts";
import { processFrameB } from "../_shared/frame-b-handler.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Parse and validate input
    const { vai, session_id, capture } = await req.json();

    if (!vai || !session_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: vai, session_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Renew] Processing renewal for V.A.I. ${vai}, session ${session_id}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 2: Validate session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      console.error(`[Renew] Session not found: ${session_id}`);
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (session.route !== "renewal") {
      console.error(`[Renew] Invalid session route: ${session.route}, expected 'renewal'`);
      return new Response(
        JSON.stringify({ error: "Session is not a renewal session" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (session.vai !== vai) {
      console.error(`[Renew] Session VAI mismatch: session=${session.vai}, request=${vai}`);
      throw new Error("Session VAI mismatch - authorization violation");
    }

    console.log(`[Renew] Session validated: route=${session.route}, state=${session.state}`);

    // Step 3: Load credential
    const { data: credential, error: credentialError } = await supabase
      .from("credentials")
      .select("*")
      .eq("vai", vai)
      .single();

    if (credentialError || !credential) {
      console.error(`[Renew] Credential not found: ${vai}`);
      return new Response(
        JSON.stringify({ error: "Credential not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(
      `[Renew] Credential loaded: state=${credential.state}, ` +
      `next_renewal=${credential.next_renewal_date}, ` +
      `next_complycube=${credential.next_complycube_date}`
    );

    // Step 4: THE DECISION - Frame A or Frame B (using shared logic)
    const frame = determineRenewalFrame(credential.next_complycube_date);
    console.log(`[Renew] Frame ${frame} determined`);

    let result: any;

    if (frame === "A") {
      // FRAME A: ComplyCube required (new document needed)
      console.log(`[Renew] Frame A - ComplyCube required`);

      try {
        const complycubeResult = await createComplyCubeFlowSession(
          supabase,
          session.id,
          credential.complycube_client_id
        );

        // Update session frame
        await supabase
          .from("sessions")
          .update({ frame: "A" })
          .eq("id", session.id);

        result = {
          frame: "A",
          session_id: complycubeResult.session_id,
          redirect_url: complycubeResult.redirect_url,
        };
      } catch (error) {
        // Check if it's a queued error
        if (error instanceof Error && error.message.startsWith("QUEUED:")) {
          result = {
            frame: "A",
            session_id: session.id,
            queued: true,
            message: error.message.replace("QUEUED:", ""),
          };
        } else {
          throw error;
        }
      }
    } else {
      // FRAME B: Face check only (document still valid)
      console.log(`[Renew] Frame B - Face check only`);

      if (!capture) {
        console.log("[Renew] Frame B - no capture provided");
        result = {
          frame: "B",
          message: "Capture required for Frame B renewal",
        };
      } else {
        // Process face check using shared logic
        const match = await processFrameB(supabase, vai, capture);

        // Update session frame
        await supabase
          .from("sessions")
          .update({ frame: "B" })
          .eq("id", session.id);

        // If match: update next_renewal_date (move forward 1 year)
        if (match) {
          console.log(`[Renew] Match - updating renewal date`);

          const currentRenewalDate = new Date(credential.next_renewal_date);
          const newRenewalDate = new Date(currentRenewalDate);
          newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);

          const { error: updateError } = await supabase
            .from("credentials")
            .update({
              next_renewal_date: newRenewalDate.toISOString().split('T')[0],
            })
            .eq("vai", vai);

          if (updateError) {
            console.error(`[Renew] Error updating renewal date:`, updateError);
            throw new Error(`Failed to update renewal date: ${updateError.message}`);
          }

          // Update session to complete
          await supabase
            .from("sessions")
            .update({ state: "complete" })
            .eq("id", session.id);

          console.log(`[Renew] Renewal complete, new date: ${newRenewalDate.toISOString().split('T')[0]}`);
        } else {
          console.log(`[Renew] No match - renewal failed`);
        }

        result = {
          frame: "B",
          result: match ? "match" : "no_match",
        };
      }
    }

    console.log(`[Renew] Complete:`, result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Renew] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
