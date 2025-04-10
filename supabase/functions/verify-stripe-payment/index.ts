
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Types for better code readability
interface VerificationRequest {
  paymentIntentId: string;
  transactionId: string;
}

interface VerificationResponse {
  transaction?: any;
  message: string;
  status: string;
  paymentStatus?: string;
}

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize clients with proper error handling
const initializeClients = () => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  return { stripe, supabaseClient };
};

// Authenticate user and validate request
const authenticateRequest = async (req: Request, supabaseClient: any) => {
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

  return user;
};

// Get transaction from database
const getTransaction = async (supabaseClient: any, transactionId: string, userId: string) => {
  const { data: transaction, error: txError } = await supabaseClient
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .eq("user_id", userId)
    .single();
  
  if (txError || !transaction) {
    console.error("[VERIFY] Transaction not found or not authorized:", txError);
    throw new Error("Transaction not found or not authorized");
  }
  
  console.log(`[VERIFY] Found transaction: ID ${transaction.id}, status: ${transaction.status}`);
  return transaction;
};

// Create notification for the user
const createNotification = async (supabaseClient: any, userId: string, amount: number) => {
  try {
    const { error: notifError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'payment_confirmed',
        title: 'Payment Confirmed',
        message: `Your payment of $${amount.toFixed(2)} has been confirmed. Tokens will be sent to your wallet shortly.`
      });
      
    if (notifError) {
      console.error("[VERIFY] Error creating notification:", notifError);
    } else {
      console.log("[VERIFY] Created payment confirmation notification");
    }
  } catch (notifErr) {
    console.error("[VERIFY] Error in notification creation:", notifErr);
  }
};

// Update transaction status if needed
const updateTransactionStatus = async (
  supabaseClient: any, 
  transaction: any, 
  user: any, 
  paymentIntent: any
) => {
  // If transaction is already completed, just return it
  if (transaction.status === "completed") {
    console.log(`[VERIFY] Transaction already marked as completed`);
    return {
      transaction, 
      message: "Transaction already marked as completed",
      status: "already_completed"
    };
  }

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
    
    // Create a notification
    await createNotification(supabaseClient, user.id, transaction.amount);
    
    return {
      transaction: updatedTransaction, 
      message: "Transaction updated to completed status",
      status: "updated"
    };
  }

  // If payment is still processing in Stripe
  if (paymentIntent.status === "processing") {
    return {
      transaction, 
      message: "Payment is still processing in Stripe",
      status: "processing"
    };
  }

  // Default response when no update was needed
  return {
    transaction, 
    message: "No status update needed", 
    paymentStatus: paymentIntent.status,
    status: "no_change"
  };
};

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize clients
    const { stripe, supabaseClient } = initializeClients();

    // Authenticate user
    const user = await authenticateRequest(req, supabaseClient);

    // Parse the request body
    const { paymentIntentId, transactionId } = await req.json() as VerificationRequest;
    
    if (!paymentIntentId) {
      throw new Error("Missing payment intent ID");
    }

    console.log(`[VERIFY] Verifying Stripe payment status for ${paymentIntentId}`);
    
    // Get transaction from database
    const transaction = await getTransaction(supabaseClient, transactionId, user.id);
    
    // Retrieve payment intent directly from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log(`[VERIFY] Retrieved payment intent from Stripe: ID ${paymentIntent.id}, status: ${paymentIntent.status}`);

    // Process transaction update based on payment intent status
    const result = await updateTransactionStatus(supabaseClient, transaction, user, paymentIntent);

    return new Response(
      JSON.stringify(result),
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
