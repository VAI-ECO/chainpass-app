import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface CheckVAIRequest {
  vai_number: string;
  requesting_platform: string;
}

interface MissingRequirement {
  requirement_key: string;
  display_name: string;
  completion_url: string;
}

/**
 * Write a lookup log entry
 * Called on every request, including not_found
 */
async function logLookup(
  supabase: any,
  vai: string,
  platformId: string,
  found: boolean
): Promise<void> {
  try {
    await supabase.from("lookup_log").insert({
      vai: vai,
      platform_id: platformId,
      found: found,
    });
  } catch (error) {
    // Log but don't fail the request if logging fails
    console.error("[Lookup Log] Failed to write:", error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { vai_number, requesting_platform }: CheckVAIRequest = await req.json();

    // Validate required fields
    if (!vai_number || !requesting_platform) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: "Missing required fields: vai_number and requesting_platform are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const normalizedVAI = vai_number.toUpperCase();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // STEP 1: Load credential
    const { data: credential, error: credentialError } = await supabase
      .from("credentials")
      .select("vai, state, next_renewal_date, document_expiry")
      .eq("vai", normalizedVAI)
      .maybeSingle();

    if (credentialError || !credential) {
      // VAI does not exist - log and return not_found
      await logLookup(supabase, normalizedVAI, requesting_platform, false);

      return new Response(
        JSON.stringify({
          valid: false,
          message: "VAI number not found",
          create_url: `https://verify.chainpass.io/enroll?platform=${requesting_platform}`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // STEP 2: Check ChainPass suspension/ban BEFORE scope check
    // This prevents leaking platform history via timing:
    // - Banned credentials are banned everywhere, no scope needed
    // - Returning banned before scope check means same response regardless of platform history
    if (credential.state === "suspended" || credential.state === "banned") {
      await logLookup(supabase, normalizedVAI, requesting_platform, true);

      return new Response(
        JSON.stringify({
          valid: true,
          qualified: false,
          credential_state: credential.state,
          platform_state: "active", // Not rejected by platform, banned by ChainPass
          reason: `Credential ${credential.state}`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // STEP 3: Scope check - credential_platforms row must exist
    // This prevents enumeration: a VAI that never presented here is indistinguishable from non-existent
    const { data: platformLink, error: platformLinkError } = await supabase
      .from("credential_platforms")
      .select("state, state_note")
      .eq("vai", normalizedVAI)
      .eq("platform_id", requesting_platform)
      .maybeSingle();

    if (platformLinkError || !platformLink) {
      // No credential_platforms row = VAI never presented at this platform
      // Identical response to non-existent VAI
      await logLookup(supabase, normalizedVAI, requesting_platform, false);

      return new Response(
        JSON.stringify({
          valid: false,
          message: "VAI number not found",
          create_url: `https://verify.chainpass.io/enroll?platform=${requesting_platform}`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // STEP 4: Platform rejection check
    // credential_platforms.state is the PLATFORM's decision, applies only here
    // This is different from credentials.state (ChainPass's decision, applies everywhere)
    if (platformLink.state === "rejected") {
      await logLookup(supabase, normalizedVAI, requesting_platform, true);

      return new Response(
        JSON.stringify({
          valid: true,
          qualified: false,
          credential_state: credential.state,
          platform_state: "rejected",
          reason: "Platform has rejected this credential",
          state_note: platformLink.state_note || null,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // STEP 5: Load platform requirements
    const { data: platformReqs, error: platformReqsError } = await supabase
      .from("platform_requirements")
      .select(`
        requirement_key,
        requirements!inner(display_name, kind)
      `)
      .eq("platform_id", requesting_platform)
      .order("sort_order", { ascending: true });

    if (platformReqsError) {
      console.error("[Platform Requirements] Error:", platformReqsError);
      return new Response(
        JSON.stringify({
          valid: false,
          message: "Unknown platform",
          error: "Platform requirements not found",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // STEP 6: Load completions
    // Include both platform-specific AND ecosystem-wide (platform_id IS NULL)
    // Ecosystem-wide completions are signed once, valid everywhere
    const { data: completions, error: completionsError } = await supabase
      .from("requirement_completions")
      .select("requirement_key, signed_version, platform_id")
      .eq("vai", normalizedVAI)
      .or(`platform_id.eq.${requesting_platform},platform_id.is.null`);

    if (completionsError) {
      console.error("[Completions] Error:", completionsError);
    }

    const completedKeys = new Set(
      (completions || []).map((c: any) => c.requirement_key)
    );

    // STEP 7: Calculate missing requirements
    const missing: MissingRequirement[] = [];

    for (const req of platformReqs || []) {
      if (!completedKeys.has(req.requirement_key)) {
        // Requirement not completed
        const displayName = req.requirements?.display_name || req.requirement_key;

        missing.push({
          requirement_key: req.requirement_key,
          display_name: displayName,
          completion_url: `https://verify.chainpass.io/complete/${req.requirement_key}?vai=${normalizedVAI}&platform=${requesting_platform}`,
        });
      }
    }

    // STEP 8: Write lookup log (every call, always)
    await logLookup(supabase, normalizedVAI, requesting_platform, true);

    // STEP 9: Return success response
    return new Response(
      JSON.stringify({
        valid: true,
        qualified_for_platform: missing.length === 0,
        vai_number: normalizedVAI,
        credential_state: credential.state,
        platform_state: platformLink.state,
        expires_at: credential.next_renewal_date,
        document_expiry: credential.document_expiry,
        missing_requirements: missing,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("[Check VAI Requirements] Error:", error);
    return new Response(
      JSON.stringify({
        valid: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
