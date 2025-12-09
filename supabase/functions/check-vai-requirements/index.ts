import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface CheckVAIRequest {
  vai_number: string;
  requesting_platform: string;
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

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Check if VAI number exists in database (using vais view)
    const { data: vai, error: vaiError } = await supabase
      .from("vais")
      .select("*")
      .eq("vai_number", vai_number.toUpperCase())
      .single();

    // VAI not found
    if (vaiError || !vai) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: "VAI number not found",
          suggest_create_new: true,
          create_url: `https://chainpass.com/create-vai?platform=${requesting_platform}`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Check VAI status (suspended/banned)
    if (vai.status === "suspended" || vai.status === "banned") {
      return new Response(
        JSON.stringify({
          valid: true,
          qualified: false,
          reason: `VAI ${vai.status}`,
          contact_support: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Get platform requirements
    const { data: platformReqs, error: platformReqsError } = await supabase
      .from("platform_requirements")
      .select("*")
      .eq("platform_name", requesting_platform)
      .single();

    if (platformReqsError || !platformReqs) {
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

    // 4. Check completions for this platform
    const { data: completion } = await supabase
      .from("vai_platform_completions")
      .select("*")
      .eq("vai_number", vai_number.toUpperCase())
      .eq("platform_name", requesting_platform)
      .single();

    // 5. Determine missing requirements
    const missing: Array<{
      requirement: string;
      display_name: string;
      completion_url: string;
    }> = [];

    if (platformReqs.requires_payment && (!completion || !completion.payment_verified)) {
      missing.push({
        requirement: "payment",
        display_name: "Payment Verification",
        completion_url: `https://chainpass.com/complete/payment?vai=${vai_number}&platform=${requesting_platform}`,
      });
    }

    if (platformReqs.requires_identity && (!completion || !completion.identity_verified)) {
      missing.push({
        requirement: "identity",
        display_name: "Identity Verification",
        completion_url: `https://chainpass.com/complete/identity?vai=${vai_number}&platform=${requesting_platform}`,
      });
    }

    if (
      platformReqs.requires_le_declaration &&
      (!completion || !completion.le_declaration_signed)
    ) {
      missing.push({
        requirement: "le_declaration",
        display_name: "Law Enforcement Declaration",
        completion_url: `https://chainpass.com/complete/le-declaration?vai=${vai_number}&platform=${requesting_platform}`,
      });
    }

    if (
      platformReqs.requires_signature &&
      (!completion || !completion.signature_agreement_signed)
    ) {
      missing.push({
        requirement: "signature_agreement",
        display_name: "V.A.I. Signature Agreement",
        completion_url: `https://chainpass.com/complete/signature?vai=${vai_number}&platform=${requesting_platform}`,
      });
    }

    // 6. Calculate payment status and timing
    const createdAt = new Date(vai.original_vai_created_at);
    const currentDate = new Date();
    const expiresAt = new Date(createdAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const timeElapsedMs = currentDate.getTime() - createdAt.getTime();
    const timeElapsedDays = Math.floor(timeElapsedMs / (1000 * 60 * 60 * 24));
    const remainingMs = expiresAt.getTime() - currentDate.getTime();
    const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));

    // Determine payment status
    let paymentStatus: any;
    const isPaid =
      vai.payment_status === "completed" ||
      vai.payment_status === "succeeded" ||
      vai.payment_status === "paid";

    if (isPaid && vai.payment_completed_at) {
      paymentStatus = {
        is_paid: true,
        payment_date: vai.payment_completed_at,
        expires_at: expiresAt.toISOString(),
        remaining_days: remainingDays,
        warning: null,
      };
    } else {
      const clampedRemaining = Math.max(0, remainingDays);
      const expirationText =
        clampedRemaining > 0
          ? `Pay now to unlock the remaining ${clampedRemaining} day${clampedRemaining === 1 ? '' : 's'} on this annual term.`
          : "Your V.A.I. is expired and locked until you renew.";

      paymentStatus = {
        is_paid: false,
        created_at: createdAt.toISOString(),
        current_date: currentDate.toISOString(),
        time_elapsed_days: timeElapsedDays,
        expires_at: expiresAt.toISOString(),
        remaining_if_paid_now: clampedRemaining,
        warning: expirationText,
      };
    }

    // 7. Get list of completed platforms
    const { data: allCompletions } = await supabase
      .from("vai_platform_completions")
      .select("platform_name")
      .eq("vai_number", vai_number.toUpperCase())
      .eq("is_qualified", true);

    const completedPlatforms = allCompletions?.map((c) => c.platform_name) || [];

    // 8. Build response
    const response: any = {
      valid: true,
      qualified_for_platform: missing.length === 0,
      vai_number: vai_number.toUpperCase(),
      created_at: vai.original_vai_created_at,
      completed_platforms: completedPlatforms,
      missing_requirements: missing,
      payment_status: paymentStatus,
    };

    // Add user email if available (from profiles table)
    // Note: This would require joining with profiles table if user_id is stored
    // For now, we'll skip this as it's not in the vais view

    // Return appropriate response based on qualification status
    if (missing.length === 0) {
      // Fully qualified
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Missing requirements
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error in check-vai-requirements:", error);
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









