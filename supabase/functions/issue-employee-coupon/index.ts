import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const getServiceClient = () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing Supabase credentials");
  return createClient(url, key);
};

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { business_id, issued_by_vai, recipient_email, recipient_phone } = await req.json();

    if (!business_id || !issued_by_vai) {
      return new Response(
        JSON.stringify({ error: "business_id and issued_by_vai are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = getServiceClient();

    const { data: business, error } = await supabase
      .from("business_records")
      .select("*")
      .eq("id", business_id)
      .maybeSingle();

    if (error || !business) {
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (business.owner_vai !== issued_by_vai) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const remaining = business.coupons_total - business.coupons_issued;
    if (remaining <= 0) {
      return new Response(JSON.stringify({ error: "No coupons available" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const couponCode = `EMP-${business.business_vai}-${generateCode()}`;

    const { error: insertError } = await supabase.from("employee_coupons").insert({
      coupon_code: couponCode,
      business_id,
      business_vai: business.business_vai,
      status: "issued",
      issued_by_vai,
      issued_to_email: recipient_email || null,
      issued_to_phone: recipient_phone || null,
      issued_at: new Date().toISOString(),
    });

    if (insertError) throw insertError;

    await supabase
      .from("business_records")
      .update({ coupons_issued: business.coupons_issued + 1 })
      .eq("id", business_id);

    return new Response(
      JSON.stringify({ success: true, coupon_code: couponCode, coupons_remaining: remaining - 1 }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[issue-employee-coupon] error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

