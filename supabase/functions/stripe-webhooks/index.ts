
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const createSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
};

// Initialize Stripe with API key
const createStripeClient = () => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
  }
  
  return new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
  });
};

// Verify Stripe webhook signature
const verifyStripeSignature = (body: string, signature: string) => {
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
  }
  
  const stripe = createStripeClient();
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
};

// Create notification for user when payment is confirmed
const createPaymentConfirmationNotification = async (supabase, userId, amount) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'payment_confirmed',
        title: 'Payment Confirmed',
        message: `Your payment of $${typeof amount === 'number' ? amount.toFixed(2) : amount} has been confirmed. Tokens will be sent to your wallet shortly.`
      });
      
    if (error) {
      console.error(`[WEBHOOK] Error creating notification: ${error.message}`);
      return false;
    }
    
    console.log(`[WEBHOOK] Successfully created notification for user ${userId}`);
    return true;
  } catch (err) {
    console.error(`[WEBHOOK] Error in notification creation: ${err.message}`);
    return false;
  }
};

// Update transaction status to completed
const updateTransactionStatus = async (supabase, transaction, paymentIntentId = null) => {
  if (!transaction) return null;
  
  // Log status change
  console.log(`[WEBHOOK] STATUS UPDATE: Changing transaction ${transaction.id} status from "${transaction.status}" to "completed"`);
  
  try {
    const updateData = {
      status: 'completed',
      updated_at: new Date().toISOString(),
      token_sent: false
    };
    
    // Add payment intent ID if provided
    if (paymentIntentId) {
      updateData.external_transaction_id = paymentIntentId;
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transaction.id)
      .select()
      .single();
      
    if (error) {
      console.error(`[WEBHOOK] Error updating transaction: ${error.message}`);
      throw error;
    }
    
    console.log(`[WEBHOOK] Successfully updated transaction status for ID ${transaction.id}`, 
      JSON.stringify({
        tx_id: data.id,
        new_status: data.status,
        payment_intent: data.external_transaction_id
      })
    );
    
    return data;
  } catch (err) {
    console.error(`[WEBHOOK] Error in transaction update: ${err.message}`);
    throw err;
  }
};

// Find transaction by session ID
const findTransactionBySessionId = async (supabase, sessionId) => {
  console.log(`[WEBHOOK] Checking transaction with ID: ${sessionId}`);
  
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('transaction_id', sessionId)
      .maybeSingle();
      
    if (error) {
      console.error(`[WEBHOOK] Error fetching transaction by session ID: ${error.message}`);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error(`[WEBHOOK] Error finding transaction by session ID: ${err.message}`);
    return null;
  }
};

// Find transaction by payment intent ID
const findTransactionByPaymentIntent = async (supabase, paymentIntentId) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('external_transaction_id', paymentIntentId)
      .maybeSingle();
      
    if (error) {
      console.error(`[WEBHOOK] Error finding transaction by payment intent: ${error.message}`);
    }
    
    return data;
  } catch (err) {
    console.error(`[WEBHOOK] Error finding transaction by payment intent: ${err.message}`);
    return null;
  }
};

// Create new transaction from session data
const createTransactionFromSession = async (supabase, session) => {
  if (!session.metadata?.user_id || !session.metadata?.wallet_address) {
    console.error(`[WEBHOOK] Cannot create transaction record: missing user_id or wallet_address in metadata`, 
      JSON.stringify(session.metadata)
    );
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: session.metadata.user_id,
        amount: (session.amount_total / 100),
        wallet_address: session.metadata.wallet_address,
        payment_method: 'stripe',
        status: 'completed',
        transaction_id: session.id,
        external_transaction_id: session.payment_intent || null,
        token_sent: false
      })
      .select()
      .single();
      
    if (error) {
      console.error(`[WEBHOOK] Error creating transaction from webhook: ${error.message}`);
      throw error;
    }
    
    console.log(`[WEBHOOK] Successfully created transaction record from webhook data`, JSON.stringify({
      tx_id: data.id,
      amount: data.amount,
      status: data.status
    }));
    
    return data;
  } catch (err) {
    console.error(`[WEBHOOK] Error in transaction creation: ${err.message}`);
    return null;
  }
};

// Find recent pending transactions
const findRecentPendingTransactions = async (supabase) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) {
      console.error(`[WEBHOOK] Error finding recent pending transactions: ${error.message}`);
      return [];
    }
    
    if (data && data.length > 0) {
      console.log(`[WEBHOOK] Found ${data.length} recent pending transactions, checking for matches`);
      
      // Log all recent transactions for debugging
      data.forEach((tx, idx) => {
        console.log(`[WEBHOOK] Recent pending tx #${idx+1}:`, JSON.stringify({
          id: tx.id,
          transaction_id: tx.transaction_id,
          external_transaction_id: tx.external_transaction_id,
          status: tx.status,
          created_at: tx.created_at
        }));
      });
    }
    
    return data || [];
  } catch (err) {
    console.error(`[WEBHOOK] Error finding recent pending transactions: ${err.message}`);
    return [];
  }
};

// Handle checkout.session.completed event
const handleCheckoutSessionCompleted = async (supabase, session) => {
  console.log('[WEBHOOK] Processing completed session:', JSON.stringify({
    id: session.id,
    mode: session.mode,
    payment_status: session.payment_status,
    amount_total: session.amount_total,
    customer: session.customer,
    metadata: session.metadata
  }));
  
  // Skip if not a payment or payment not successful
  if (session.mode !== 'payment' || session.payment_status !== 'paid') {
    console.log('[WEBHOOK] Not a completed payment, skipping');
    return;
  }
  
  console.log(`[WEBHOOK] Processing completed payment for session: ${session.id}`);
  
  try {
    // First, check if we already processed this session to prevent duplicates
    const { data: existingCompletedTx, error: existingTxError } = await supabase
      .from('transactions')
      .select('id, status')
      .eq('transaction_id', session.id)
      .eq('status', 'completed')
      .maybeSingle();
      
    if (existingTxError) {
      console.error(`[WEBHOOK] Error checking existing transaction: ${existingTxError.message}`);
    }
      
    if (existingCompletedTx) {
      console.log(`[WEBHOOK] Session ${session.id} already marked as completed, skipping`);
      return;
    }
    
    // Retrieve the transaction using the session ID
    const pendingTx = await findTransactionBySessionId(supabase, session.id);
    
    if (pendingTx) {
      // Transaction exists, update it
      console.log(`[WEBHOOK] Found transaction to update:`, JSON.stringify({
        id: pendingTx.id,
        current_status: pendingTx.status,
        amount: pendingTx.amount,
        wallet_address: pendingTx.wallet_address
      }));
      
      // Update transaction status
      const updatedTx = await updateTransactionStatus(supabase, pendingTx, session.payment_intent);
      
      // Create a notification for the user
      if (pendingTx.user_id) {
        await createPaymentConfirmationNotification(supabase, pendingTx.user_id, (session.amount_total / 100).toFixed(2));
      }
    } else {
      // If transaction doesn't exist, create it from webhook data
      console.log(`[WEBHOOK] Transaction not found, attempting to create from webhook data`);
      
      const newTx = await createTransactionFromSession(supabase, session);
      
      // Create a notification for the user if transaction was created
      if (newTx && session.metadata?.user_id) {
        await createPaymentConfirmationNotification(supabase, session.metadata.user_id, (session.amount_total / 100).toFixed(2));
      }
    }
  } catch (updateError) {
    console.error(`[WEBHOOK] Exception in transaction update: ${updateError.message}`);
    console.error(updateError.stack || 'No stack trace available');
  }
};

// Handle payment_intent.succeeded event
const handlePaymentIntentSucceeded = async (supabase, paymentIntent) => {
  console.log(`[WEBHOOK] PaymentIntent ${paymentIntent.id} was successful!`, JSON.stringify({
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    metadata: paymentIntent.metadata
  }));
  
  try {
    // Try to find transaction by payment_intent ID if we have it
    if (paymentIntent.id) {
      // First check by external_transaction_id field
      const pendingTx = await findTransactionByPaymentIntent(supabase, paymentIntent.id);
      
      if (pendingTx && pendingTx.status !== 'completed') {
        // Update the transaction to completed
        console.log(`[WEBHOOK] Found transaction by payment intent, updating to completed:`, JSON.stringify({
          tx_id: pendingTx.id,
          current_status: pendingTx.status,
          amount: pendingTx.amount
        }));
        
        // Update transaction
        await updateTransactionStatus(supabase, pendingTx);
        
        // Create a notification for the user
        if (pendingTx.user_id) {
          await createPaymentConfirmationNotification(supabase, pendingTx.user_id, pendingTx.amount);
        }
      } else if (pendingTx) {
        console.log(`[WEBHOOK] Transaction already marked as completed: ${pendingTx.id}`);
      } else {
        console.log(`[WEBHOOK] No transaction found with payment intent: ${paymentIntent.id}`);
        
        // Try to find by transaction_id in case external_transaction_id is not set
        const recentPendingTxs = await findRecentPendingTransactions(supabase);
        
        // Try to find by metadata if available
        if (paymentIntent.metadata?.session_id) {
          console.log(`[WEBHOOK] Trying to find transaction by session ID: ${paymentIntent.metadata.session_id}`);
          
          const sessionTx = await findTransactionBySessionId(supabase, paymentIntent.metadata.session_id);
          
          if (sessionTx && sessionTx.status !== 'completed') {
            console.log(`[WEBHOOK] Found transaction by session ID, updating status:`, JSON.stringify({
              tx_id: sessionTx.id,
              current_status: sessionTx.status
            }));
            
            // Update the transaction with payment intent ID
            await updateTransactionStatus(supabase, sessionTx, paymentIntent.id);
          }
        }
      }
    }
  } catch (err) {
    console.error(`[WEBHOOK] Error processing payment intent: ${err.message}`);
  }
};

// Main handler for Stripe webhook events
const handleStripeWebhook = async (req) => {
  try {
    console.log("[WEBHOOK] Stripe webhook request received");
    
    // Get the stripe signature from the request header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("[WEBHOOK] No stripe signature found");
      throw new Error("No stripe signature found");
    }

    // Get the raw body
    const body = await req.text();
    console.log("[WEBHOOK] Webhook body received (truncated):", body.substring(0, 100) + "...");
    
    // Verify the webhook signature
    let event;
    try {
      event = verifyStripeSignature(body, signature);
      console.log(`[WEBHOOK] Event successfully constructed: ${event.type}`);
      console.log(`[WEBHOOK] Event ID: ${event.id}`);
    } catch (err) {
      console.error(`[WEBHOOK] Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    console.log(`[WEBHOOK] Processing webhook event: ${event.type}`, JSON.stringify({
      event_id: event.id, 
      object_id: event.data.object.id
    }));
    
    // Initialize Supabase client
    const supabaseClient = createSupabaseClient();

    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(supabaseClient, event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(supabaseClient, event.data.object);
        break;
      
      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true, event: event.type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`[WEBHOOK] Error processing webhook: ${error.message}`);
    console.error(error.stack || 'No stack trace available');
    return new Response(JSON.stringify({ error: `Webhook processing error: ${error.message}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

// Main entry point
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  return await handleStripeWebhook(req);
});
