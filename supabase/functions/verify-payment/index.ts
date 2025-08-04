import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import crypto from 'https://deno.land/std@0.168.0/node/crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, paymentId, signature, items, totalAmount } = await req.json()
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

    // 1. VERIFY THE SIGNATURE
    const generated_signature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex')

    if (generated_signature !== signature) {
      throw new Error('Payment signature is not valid')
    }

    // 2. SAVE THE ORDER TO THE DATABASE
    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')!
    )
    
    // Get user ID from the authorization header
    const authHeader = req.headers.get('Authorization')!
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)

    if (!user) throw new Error("User not found")

    // Insert into the 'orders' table
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
        status: 'paid',
      })
      .select('id')
      .single()

    if (orderError) throw orderError
    const newOrderId = orderData.id

    // Insert into the 'order_items' table
    const orderItems = items.map((item: any) => ({
      order_id: newOrderId,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price,
    }))

    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError
    
    // 3. RETURN SUCCESS
    return new Response(JSON.stringify({ success: true, orderId: newOrderId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})