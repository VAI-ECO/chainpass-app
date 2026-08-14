import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface ApplyCouponRequest {
  code: string;
  session_id: string;
}

interface ApplyCouponSuccess {
  valid: true;
  discount_cents: number;
}

interface ApplyCouponFailure {
  valid: false;
  reason: "not_found" | "expired" | "limit_reached" | "wrong_platform" | "already_applied" | "missing_base_price";
  message: string;
}

type ApplyCouponResponse = ApplyCouponSuccess | ApplyCouponFailure;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, session_id }: ApplyCouponRequest = await req.json();

    if (!code || !session_id) {
      return new Response(
        JSON.stringify({
          valid: false,
          reason: "invalid_request",
          message: "Missing required fields: code and session_id",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // CHECK 1: Coupon exists
    const { data: coupon, error: couponError } = await supabase
      .from("platform_coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (couponError || !coupon) {
      return respondFailure("not_found", `Coupon code '${code}' not found`);
    }

    // CHECK 2: Not expired
    if (coupon.expires_at && new Date(coupon.expires_at) <= new Date()) {
      return respondFailure("expired", "Coupon has expired");
    }

    // CHECK 3: used_count < max_uses (accounting for live reservations)
    const { count: liveReservations } = await supabase
      .from("platform_coupon_redemptions")
      .select("*", { count: "exact", head: true })
      .eq("code", coupon.code)
      .gt("expires_at", new Date().toISOString());

    const availableSlots = coupon.max_uses - coupon.used_count - (liveReservations ?? 0);

    if (availableSlots <= 0) {
      return respondFailure("limit_reached", "Coupon has reached its usage limit");
    }

    // CHECK 4: Platform match
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("platform_id, expires_at")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return respondFailure("not_found", `Session '${session_id}' not found`);
    }

    if (session.platform_id !== coupon.platform_id) {
      return respondFailure(
        "wrong_platform",
        `Coupon '${code}' cannot be used with platform '${session.platform_id}'`
      );
    }

    // CHECK 5: Session has not already applied a coupon
    const { data: existingRedemption } = await supabase
      .from("platform_coupon_redemptions")
      .select("id")
      .eq("session_id", session_id)
      .single();

    if (existingRedemption) {
      return respondFailure("already_applied", "A coupon has already been applied to this session");
    }

    // Calculate discount
    let discount_cents: number;

    if (coupon.amount_off !== null) {
      // Fixed amount discount
      discount_cents = coupon.amount_off;
    } else if (coupon.percent_off !== null) {
      // Percentage discount - requires base price
      const { data: platform } = await supabase
        .from("platforms")
        .select("base_price_cents")
        .eq("id", session.platform_id)
        .single();

      if (!platform || platform.base_price_cents === null) {
        return respondFailure(
          "missing_base_price",
          `Base price not configured for platform '${session.platform_id}' - required for percentage-based coupons`
        );
      }

      discount_cents = Math.floor((platform.base_price_cents * coupon.percent_off) / 100);
    } else {
      throw new Error("Coupon has neither amount_off nor percent_off set");
    }

    // RESERVE: Insert redemption record (does NOT increment used_count)
    const { error: redemptionError } = await supabase
      .from("platform_coupon_redemptions")
      .insert({
        code: coupon.code,
        session_id: session_id,
        expires_at: session.expires_at,
      });

    if (redemptionError) {
      console.error("Failed to create redemption record:", redemptionError);
      return new Response(
        JSON.stringify({
          valid: false,
          reason: "server_error",
          message: "Failed to reserve coupon",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Success
    const response: ApplyCouponSuccess = {
      valid: true,
      discount_cents,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in apply-coupon:", error);
    return new Response(
      JSON.stringify({
        valid: false,
        reason: "server_error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function respondFailure(
  reason: ApplyCouponFailure["reason"],
  message: string
): Response {
  const response: ApplyCouponFailure = {
    valid: false,
    reason,
    message,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
