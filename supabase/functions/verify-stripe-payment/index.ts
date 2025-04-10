
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe client
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the user from the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[VERIFY] No authorization header");
      throw new Error("No authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error("[VERIFY] Error getting user or user not found", userError);
      throw new Error("Error getting user or user not found");
    }

    // Parse the request body
    const { paymentIntentId, transactionId } = await req.json();
    
    if (!paymentIntentId) {
      throw new Error("Missing payment intent ID");
    }

    console.log(`[VERIFY] Verifying Stripe payment status for ${paymentIntentId}`);
    
    // Check if transaction exists and belongs to the authenticated user
    const { data: transaction, error: txError } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .single();
    
    if (txError || !transaction) {
      console.error("[VERIFY] Transaction not found or not authorized:", txError);
      throw new Error("Transaction not found or not authorized");
    }
    
    console.log(`[VERIFY] Found transaction: ID ${transaction.id}, status: ${transaction.status}`);

    // If transaction is already completed, just return it
    if (transaction.status === "completed") {
      console.log(`[VERIFY] Transaction already marked as completed`);
      return new Response(
        JSON.stringify({ 
          transaction, 
          message: "Transaction already marked as completed",
          status: "already_completed"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Retrieve payment intent directly from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log(`[VERIFY] Retrieved payment intent from Stripe: ID ${paymentIntent.id}, status: ${paymentIntent.status}`);

    // If Stripe shows payment is successful but our DB still shows pending, update it
    if (paymentIntent.status === "succeeded" && transaction.status === "pending") {
      console.log(`[VERIFY] Updating transaction status: Stripe shows succeeded but DB shows pending`);
      
      const { data: updatedTransaction, error: updateError } = await supabaseClient
        .from("transactions")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.id)
        .select()
        .single();
      
      if (updateError) {
        console.error("[VERIFY] Error updating transaction status:", updateError);
        throw new Error(`Error updating transaction: ${updateError.message}`);
      }
      
      console.log(`[VERIFY] Successfully updated transaction to completed status`);
      
      // Create a notification for the user about the payment confirmation
      try {
        const { error: notifError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'payment_confirmed',
            title: 'Payment Confirmed',
            message: `Your payment of $${transaction.amount.toFixed(2)} has been confirmed. Tokens will be sent to your wallet shortly.`
          });
          
        if (notifError) {
          console.error("[VERIFY] Error creating notification:", notifError);
        } else {
          console.log("[VERIFY] Created payment confirmation notification");
        }
      } catch (notifErr) {
        console.error("[VERIFY] Error in notification creation:", notifErr);
      }
      
      return new Response(
        JSON.stringify({ 
          transaction: updatedTransaction, 
          message: "Transaction updated to completed status",
          status: "updated"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If payment is still pending in Stripe
    if (paymentIntent.status === "processing") {
      return new Response(
        JSON.stringify({ 
          transaction, 
          message: "Payment is still processing in Stripe",
          status: "processing"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default response when no update was needed
    return new Response(
      JSON.stringify({ 
        transaction, 
        message: "No status update needed", 
        paymentStatus: paymentIntent.status,
        status: "no_change"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[VERIFY] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
