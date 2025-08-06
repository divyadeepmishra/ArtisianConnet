import { encodeHex } from "https://deno.land/std@0.208.0/encoding/hex.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Authorization, x-client-info, apikey, content-type",
};

const RAZORPAY_SECRET = Deno.env.get("RAZORPAY_SECRET") || "";

console.log("🔄 Edge Function 'verify-payment' started");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      items,
      totalAmount,
    } = body;

    console.log("📥 Incoming request body:", {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      items,
      totalAmount,
    });

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

    // ✅ Signature Verification using Web Crypto API
    const bodyToHash = `${razorpay_order_id}|${razorpay_payment_id}`;

    // Convert secret and message to Uint8Array
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(RAZORPAY_SECRET);
    const message = encoder.encode(bodyToHash);

    // Import the secret as a crypto key
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      secretKey,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Generate HMAC signature
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, message);
    const generatedSignature = encodeHex(new Uint8Array(signature));

    const isValid = generatedSignature === razorpay_signature;

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
