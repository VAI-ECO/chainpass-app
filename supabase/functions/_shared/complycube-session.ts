import { SupabaseClient } from "npm:@supabase/supabase-js@2";

interface ComplyCubeSessionResult {
  session_id: string;
  redirect_url: string;
  complycube_session_id: string;
}

/**
 * Creates a ComplyCube flow session against a stored client ID
 * Isolated boundary - fails loudly if env vars missing
 *
 * @param supabase - Supabase client
 * @param sessionId - ChainPass session ID
 * @param complycubeClientId - Stored ComplyCube client ID
 * @returns Session details with redirect URL or throws on error
 */
export async function createComplyCubeFlowSession(
  supabase: SupabaseClient,
  sessionId: string,
  complycubeClientId: string
): Promise<ComplyCubeSessionResult> {
  const COMPLYCUBE_API_KEY = Deno.env.get("COMPLYCUBE_API_KEY");
  if (!COMPLYCUBE_API_KEY) {
    throw new Error("COMPLYCUBE_API_KEY environment variable is not configured. Cannot proceed.");
  }

  console.log(`[ComplyCube] Creating flow session for client ${complycubeClientId}`);

  const origin = Deno.env.get("CHAINPASS_URL") || "https://verify.chainpass.io";

  const flowSessionRequest = {
    clientId: complycubeClientId,
    checkTypes: ["extensive_screening_check", "identity_check", "document_check"],
    successUrl: `${origin}/revalidation-complete?session=${sessionId}`,
    cancelUrl: `${origin}/revalidation-cancelled?session=${sessionId}`,
  };

  const response = await fetch("https://api.complycube.com/v1/flow/sessions", {
    method: "POST",
    headers: {
      "Authorization": COMPLYCUBE_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(flowSessionRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[ComplyCube] Unavailable: ${response.status} - ${errorText}`);

    // ComplyCube unavailable: QUEUE the session, don't fail
    // Re-verification is the only way out of lockout, so it can never fail
    await supabase
      .from("sessions")
      .update({ state: "queued" })
      .eq("id", sessionId);

    throw new Error(`QUEUED:ComplyCube service unavailable. Status: ${response.status}`);
  }

  const flowSession = await response.json();
  console.log(`[ComplyCube] Flow session created: ${flowSession.id}`);

  // Update session with ComplyCube session ID and set state
  await supabase
    .from("sessions")
    .update({
      complycube_session_id: flowSession.id,
      state: "at_provider",
    })
    .eq("id", sessionId);

  return {
    session_id: sessionId,
    redirect_url: flowSession.redirectUrl,
    complycube_session_id: flowSession.id,
  };
}
