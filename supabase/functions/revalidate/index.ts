import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { emitEvent } from "../_shared/emit-event.ts";
import { determineRenewalFrame } from "../_shared/renewal-decision.ts";
import { createComplyCubeFlowSession } from "../_shared/complycube-session.ts";
import { processFrameB } from "../_shared/frame-b-handler.ts";

type RevalidateReason = "locked" | "rebaseline" | "renewal";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Parse and validate input
    const { vai, reason, session_id, capture } = await req.json();

    if (!vai || !reason) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: vai, reason" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["locked", "rebaseline", "renewal"].includes(reason)) {
      return new Response(
        JSON.stringify({ error: "Invalid reason. Must be: locked, rebaseline, or renewal" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Revalidate] Processing ${reason} for V.A.I. ${vai}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 2: Load credential
    const { data: credential, error: credentialError } = await supabase
      .from("credentials")
      .select("*")
      .eq("vai", vai)
      .single();

    if (credentialError || !credential) {
      console.error(`[Revalidate] Credential not found: ${vai}`);
      return new Response(
        JSON.stringify({ error: "Credential not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Revalidate] Credential loaded: state=${credential.state}`);

    // Step 3: Validate credential state based on reason
    if (reason === "locked") {
      if (credential.state !== "locked") {
        console.error(`[Revalidate] State mismatch: expected 'locked', got '${credential.state}'`);
        return new Response(
          JSON.stringify({
            error: `Credential state is '${credential.state}', not 'locked'. Platform has wrong picture of member.`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (reason === "rebaseline") {
      if (credential.state === "suspended" || credential.state === "banned") {
        console.error(`[Revalidate] Cannot rebaseline ${credential.state} credential`);
        return new Response(
          JSON.stringify({
            error: `Credential is ${credential.state}. Cannot revalidate.`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (reason === "renewal") {
      if (credential.state === "suspended" || credential.state === "banned") {
        console.error(`[Revalidate] Cannot renew ${credential.state} credential`);
        return new Response(
          JSON.stringify({
            error: `Credential is ${credential.state}. Cannot renew.`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Step 4: Create or load session
    let session;

    if (session_id) {
      // Load existing session
      const { data: existingSession, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", session_id)
        .single();

      if (sessionError || !existingSession) {
        console.error(`[Revalidate] Session not found: ${session_id}`);
        return new Response(
          JSON.stringify({ error: "Session not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (existingSession.vai !== vai) {
        console.error(`[Revalidate] Session VAI mismatch: session=${existingSession.vai}, request=${vai}`);
        throw new Error("Session VAI mismatch - authorization violation");
      }

      session = existingSession;
      console.log(`[Revalidate] Loaded existing session: ${session.id}, route=${session.route}`);
    } else {
      // Create new session
      const route = reason; // locked, rebaseline, or renewal
      const frame = (reason === "locked" || reason === "rebaseline") ? "A" : null; // renewal frame decided later

      const { data: newSession, error: createError } = await supabase
        .from("sessions")
        .insert({
          platform_id: "chainpass", // Internal revalidation
          vai: vai,
          route: route,
          frame: frame,
          state: "open",
          return_url: "https://verify.chainpass.io/revalidation-complete",
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        })
        .select()
        .single();

      if (createError || !newSession) {
        console.error(`[Revalidate] Failed to create session:`, createError);
        throw new Error("Failed to create session");
      }

      session = newSession;
      console.log(`[Revalidate] Created new session: ${session.id}, route=${route}, frame=${frame}`);
    }

    // Step 5: Route to appropriate handler based on reason
    let result: any;

    if (reason === "locked" || reason === "rebaseline") {
      // FRAME A: ComplyCube required
      console.log(`[Revalidate] ${reason} - Frame A (ComplyCube)`);

      try {
        const complycubeResult = await createComplyCubeFlowSession(
          supabase,
          session.id,
          credential.complycube_client_id
        );

        result = {
          session_id: complycubeResult.session_id,
          action: "redirect",
          redirect_url: complycubeResult.redirect_url,
        };

        console.log(`[Revalidate] ComplyCube session created for ${reason}`);
      } catch (error) {
        // Check if ComplyCube is unavailable (queued)
        if (error instanceof Error && error.message.startsWith("QUEUED:")) {
          result = {
            session_id: session.id,
            action: "queued",
          };
          console.log(`[Revalidate] ComplyCube unavailable, session queued`);
        } else {
          throw error;
        }
      }
    } else if (reason === "renewal") {
      // Renewal: determine Frame A or B
      const frame = determineRenewalFrame(credential.next_complycube_date);
      console.log(`[Revalidate] Renewal - Frame ${frame} determined`);

      if (frame === "A") {
        // Frame A: ComplyCube required
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
            session_id: complycubeResult.session_id,
            action: "redirect",
            redirect_url: complycubeResult.redirect_url,
          };

          console.log(`[Revalidate] Renewal Frame A - ComplyCube session created`);
        } catch (error) {
          // Check if ComplyCube is unavailable (queued)
          if (error instanceof Error && error.message.startsWith("QUEUED:")) {
            result = {
              session_id: session.id,
              action: "queued",
            };
            console.log(`[Revalidate] ComplyCube unavailable, session queued`);
          } else {
            throw error;
          }
        }
      } else {
        // Frame B: Capture required
        if (!capture) {
          // No capture yet, tell platform to collect it
          result = {
            session_id: session.id,
            action: "capture_required",
          };
          console.log(`[Revalidate] Renewal Frame B - capture required`);
        } else {
          // Process face check
          const match = await processFrameB(supabase, vai, capture);

          // Update session frame
          await supabase
            .from("sessions")
            .update({ frame: "B" })
            .eq("id", session.id);

          // If match: update next_renewal_date (move forward 1 year)
          if (match) {
            console.log(`[Revalidate] Renewal Frame B - match, updating renewal date`);

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
              console.error(`[Revalidate] Error updating renewal date:`, updateError);
              throw new Error(`Failed to update renewal date: ${updateError.message}`);
            }

            // Update session to complete
            await supabase
              .from("sessions")
              .update({ state: "complete" })
              .eq("id", session.id);

            console.log(`[Revalidate] Renewal complete, new date: ${newRenewalDate.toISOString().split('T')[0]}`);
          } else {
            console.log(`[Revalidate] Renewal Frame B - no match`);
          }

          result = {
            session_id: session.id,
            action: "complete",
            result: match ? "match" : "no_match",
          };
        }
      }
    }

    console.log(`[Revalidate] Complete:`, result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Revalidate] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
