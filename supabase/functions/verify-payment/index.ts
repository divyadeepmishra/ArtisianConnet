// supabase/functions/verify-payment/index.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

console.log("🔄 Edge Function 'verify-payment' started");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders });
  }

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      await req.json();

    console.log("📥 Incoming request body:", {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    });

    // Validate body
    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      console.error("❌ Missing required payment fields");
      return new Response(
        JSON.stringify({ error: "Missing payment information" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Simulate verification (replace with actual logic)
    const isValid = razorpay_signature === "demo_signature"; // placeholder
    if (!isValid) {
      console.error("❌ Payment verification failed");
      return new Response(
        JSON.stringify({ error: "Payment verification failed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    console.log("✅ Payment verified successfully");

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("❌ Internal Server Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
