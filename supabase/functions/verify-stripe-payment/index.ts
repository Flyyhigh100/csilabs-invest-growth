
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
    const { transactionId, paymentIntentId } = await req.json();
    
    if (!transactionId || !paymentIntentId) {
      throw new Error("Missing required parameters: transactionId and paymentIntentId are required");
    }

    console.log(`Verifying payment for transaction: ${transactionId}, payment intent: ${paymentIntentId}`);
    
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Initialize Stripe client
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // First, retrieve transaction from Supabase
    const { data: transaction, error: txError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (txError) {
      console.error("Error retrieving transaction:", txError);
      throw new Error(`Transaction retrieval failed: ${txError.message}`);
    }

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // If transaction already completed, return early
    if (transaction.status === "completed") {
      return new Response(
        JSON.stringify({
          success: true,
          updated: false,
          message: "Transaction already marked as completed",
          transaction,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log(`Retrieved payment intent status: ${paymentIntent.status}`);

    // If payment is successful but transaction is still pending, update transaction
    if (paymentIntent.status === "succeeded" && transaction.status === "pending") {
      const { data: updatedTransaction, error: updateError } = await supabaseAdmin
        .from("transactions")
        .update({
          status: "completed",
          external_transaction_id: paymentIntentId, // Ensure this is saved
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .eq("id", transactionId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating transaction:", updateError);
        throw new Error(`Transaction update failed: ${updateError.message}`);
      }

      // Create a notification for the user
      await supabaseAdmin
        .from("notifications")
        .insert({
          user_id: transaction.user_id,
          type: "payment_confirmed",
          title: "Payment Confirmed",
          message: `Your payment of $${transaction.amount.toFixed(2)} has been confirmed.`
        });

      console.log("Transaction successfully updated to completed");
      return new Response(
        JSON.stringify({
          success: true,
          updated: true,
          message: "Transaction status updated to completed",
          transaction: updatedTransaction,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Payment not successful or other status
    return new Response(
      JSON.stringify({
        success: true,
        updated: false,
        message: `No update needed. Stripe status: ${paymentIntent.status}, DB status: ${transaction.status}`,
        payment_status: paymentIntent.status,
        transaction_status: transaction.status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error verifying payment:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
