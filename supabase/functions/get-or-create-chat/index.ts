// supabase/functions/get-or-create-chat/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { clerkClient, requireAuth } from "npm:@clerk/clerk-sdk-node";

serve(async (req) => {
  try {
    // Verify Clerk session
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const session = await clerkClient.sessions.verifySession(token);
    const buyerId = session.userId;

    const { productId } = await req.json();
    if (!productId) {
      return new Response(JSON.stringify({ error: "Missing productId" }), {
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get product & seller
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, seller_id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
      });
    }

    const sellerId = product.seller_id;
    if (sellerId === buyerId) {
      return new Response(
        JSON.stringify({ error: "Cannot create chat with yourself" }),
        { status: 400 }
      );
    }

    // Check for existing chat
    const { data: existingChat } = await supabase
      .from("chats")
      .select("*")
      .contains("participant_ids", [buyerId, sellerId])
      .maybeSingle();

    if (existingChat) {
      return new Response(JSON.stringify({ chat: existingChat }), {
        status: 200,
      });
    }

    // Create new chat
    const { data: newChat, error: chatError } = await supabase
      .from("chats")
      .insert({
        participant_ids: [buyerId, sellerId],
      })
      .select("*")
      .single();

    if (chatError) {
      return new Response(JSON.stringify({ error: chatError.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ chat: newChat }), {
      status: 201,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
