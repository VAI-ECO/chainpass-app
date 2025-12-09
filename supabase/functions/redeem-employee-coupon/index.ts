import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const getServiceClient = () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing Supabase credentials");
  return createClient(url, key);
};

const buildComposite = (businessVai: string, personalVai: string) =>
  `${businessVai}-${personalVai.slice(0, 4)}`;

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
    const { coupon_code, personal_vai } = await req.json();

    if (!coupon_code || !personal_vai) {
      return new Response(JSON.stringify({ error: "coupon_code and personal_vai required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getServiceClient();

    const { data: coupon, error } = await supabase
      .from("employee_coupons")
      .select("*")
      .eq("coupon_code", coupon_code)
      .maybeSingle();

    if (error || !coupon) {
      return new Response(JSON.stringify({ error: "Coupon not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (coupon.status !== "issued") {
      return new Response(JSON.stringify({ error: "Coupon already used or unavailable" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: vai } = await supabase
      .from("vai_records")
      .select("vai_number")
      .eq("vai_number", personal_vai.toUpperCase())
      .maybeSingle();

    if (!vai) {
      return new Response(JSON.stringify({ error: "Personal V.A.I. not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const compositeVai = buildComposite(coupon.business_vai, vai.vai_number);

    const { error: compositeError } = await supabase.from("composite_vai_records").insert({
      composite_vai: compositeVai,
      personal_vai: vai.vai_number,
      business_vai: coupon.business_vai,
      business_id: coupon.business_id,
      coupon_id: coupon.id,
      status: "active",
      hired_at: new Date().toISOString(),
    });

    if (compositeError) throw compositeError;

    await supabase
      .from("employee_coupons")
      .update({
        status: "redeemed",
        redeemed_by_vai: vai.vai_number,
        redeemed_at: new Date().toISOString(),
        composite_vai: compositeVai,
      })
      .eq("id", coupon.id);

    await supabase
      .from("business_records")
      .update({ coupons_redeemed: (coupon.coupons_redeemed || 0) + 1 })
      .eq("id", coupon.business_id);

    return new Response(
      JSON.stringify({ success: true, composite_vai: compositeVai, personal_vai: vai.vai_number }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[redeem-employee-coupon] error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

