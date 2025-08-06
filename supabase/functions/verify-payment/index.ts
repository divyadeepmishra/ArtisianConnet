import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { encodeHex } from "https://deno.land/std@0.208.0/encoding/hex.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RAZORPAY_SECRET = Deno.env.get("RAZORPAY_SECRET") || "";
const SUPABASE_URL = Deno.env.get("PROJECT_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;

interface PaymentVerificationRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  items: Array<{
    id: number;        // product_id as BIGINT
    quantity: number;
    price: number;     // unit_price
    name?: string;
  }>;
  totalAmount: number;
  userId: string;      // UUID from Clerk
}

console.log("🔄 Edge Function 'verify-payment' started");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
    );
  }

  try {
    const body: PaymentVerificationRequest = await req.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      items,
      totalAmount,
      userId,
    } = body;

    console.log("📥 Payment verification request:", {
      razorpay_payment_id,
      razorpay_order_id,
      itemsCount: items?.length,
      totalAmount,
      userId,
    });

    // Input validation
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required payment or user information" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Items array is required and must not be empty" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!RAZORPAY_SECRET) {
      console.error("❌ RAZORPAY_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Payment service configuration error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Verify Razorpay signature
    const bodyToHash = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(RAZORPAY_SECRET);
    const message = encoder.encode(bodyToHash);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      secretKey,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, message);
    const generatedSignature = encodeHex(new Uint8Array(signature));

    if (generatedSignature !== razorpay_signature) {
      console.error("❌ Payment verification failed: Signature mismatch");
      return new Response(
        JSON.stringify({ error: "Payment verification failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    console.log("✅ Payment signature verified successfully");

    // Validate total amount
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      console.error("❌ Total amount mismatch");
      return new Response(
        JSON.stringify({ error: "Total amount validation failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("✍️ Saving order to database...");
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    try {
      // Insert order (using only existing columns)
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from("orders")
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          status: "paid",
          razorpay_payment_id: razorpay_payment_id,
          razorpay_order_id: razorpay_order_id,
          razorpay_signature: razorpay_signature,
        })
        .select("id")
        .single();

      if (orderError) {
        console.error("❌ Order creation failed:", orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      const newOrderId = orderData.id;
      console.log(`✅ Order ${newOrderId} created`);

      // Insert order items
      const orderItems = items.map(item => ({
        order_id: newOrderId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price, // Assuming 50 is the shipping cost
        total_price: item.price * item.quantity 
      }));

      const { error: itemsError } = await supabaseAdmin
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("❌ Order items failed:", itemsError);
        // Rollback order
        await supabaseAdmin.from("orders").delete().eq("id", newOrderId);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      console.log(`✅ Order ${newOrderId} completed successfully`);

      // Optional: Log payment details separately for tracking
      console.log("💳 Payment Details:", {
        orderId: newOrderId,
        razorpay_payment_id,
        razorpay_order_id,
        amount: totalAmount
      });

      return new Response(
        JSON.stringify({
          success: true,
          orderId: newOrderId,
          message: "Payment verified and order created successfully"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );

    } catch (dbError) {
      console.error("❌ Database error:", dbError);
      return new Response(
        JSON.stringify({
          error: "Failed to save order",
          details: dbError instanceof Error ? dbError.message : "Database error"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});