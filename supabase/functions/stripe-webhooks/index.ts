
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

// Verify Stripe webhook signature - ASYNC version
const verifyStripeSignatureAsync = async (body: string, signature: string) => {
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
  }
  
  const stripe = createStripeClient();
  // Use constructEventAsync instead of constructEvent
  return await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
};

// Create notification for user when payment is confirmed
const createPaymentConfirmationNotification = async (supabase, userId, amount) => {
  try {
    console.log(`[WEBHOOK] Creating notification for user ${userId} about payment of $${amount}`);
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'payment_confirmed',
        title: 'Payment Confirmed',
        message: `Your payment of $${typeof amount === 'number' ? amount.toFixed(2) : amount} has been confirmed. Tokens will be sent to your wallet shortly.`
      })
      .select();
      
    if (error) {
      console.error(`[WEBHOOK] Error creating notification: ${error.message}`);
      return false;
    }
    
    console.log(`[WEBHOOK] Successfully created notification ${data[0].id} for user ${userId}`);
    return true;
  } catch (err) {
    console.error(`[WEBHOOK] Error in notification creation: ${err.message}`);
    return false;
  }
};

// Update transaction status to completed
const updateTransactionStatus = async (supabase, transaction, paymentIntentId = null) => {
  if (!transaction) return null;
  
  // Log detailed status change information
  console.log(`[WEBHOOK] STATUS UPDATE: Changing transaction ${transaction.id} status from "${transaction.status}" to "completed"`);
  console.log(`[WEBHOOK] Transaction details: ${JSON.stringify({
    tx_id: transaction.id,
    current_status: transaction.status,
    user_id: transaction.user_id,
    amount: transaction.amount,
    wallet_address: transaction.wallet_address
  })}`);
  
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
    
    // Log the exact query we're about to execute
    console.log(`[WEBHOOK] Executing update on 'transactions' table with data: ${JSON.stringify(updateData)}`);
    console.log(`[WEBHOOK] WHERE id = '${transaction.id}'`);
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transaction.id)
      .select()
      .single();
      
    if (error) {
      console.error(`[WEBHOOK] Error updating transaction: ${error.message}`, error);
      
      // Attempt direct database verification to see if status was actually updated
      const { data: verificationData, error: verificationError } = await supabase
        .from('transactions')
        .select('id, status, updated_at')
        .eq('id', transaction.id)
        .single();
      
      if (verificationError) {
        console.error(`[WEBHOOK] Verification check failed: ${verificationError.message}`);
      } else {
        console.log(`[WEBHOOK] Current transaction state in DB: ${JSON.stringify(verificationData)}`);
        
        // If verification shows status is completed despite update error, consider it a success
        if (verificationData?.status === 'completed') {
          console.log(`[WEBHOOK] Transaction status appears to be completed despite update error.`);
          return verificationData;
        }
      }
      
      throw error;
    }
    
    console.log(`[WEBHOOK] Successfully updated transaction status for ID ${transaction.id}`, 
      JSON.stringify({
        tx_id: data.id,
        new_status: data.status,
        updated_at: data.updated_at,
        payment_intent: data.external_transaction_id
      })
    );
    
    return data;
  } catch (err) {
    console.error(`[WEBHOOK] Error in transaction update: ${err.message}`);
    console.error(err.stack || 'No stack trace available');
    throw err;
  }
};

// Find transaction by session ID
const findTransactionBySessionId = async (supabase, sessionId) => {
  console.log(`[WEBHOOK] Checking transaction with session ID: ${sessionId}`);
  
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
    
    if (data) {
      console.log(`[WEBHOOK] Found transaction by session ID: ${JSON.stringify({
        id: data.id,
        status: data.status,
        amount: data.amount
      })}`);
    } else {
      console.log(`[WEBHOOK] No transaction found with session ID: ${sessionId}`);
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
    console.log(`[WEBHOOK] Searching for transaction with payment intent ID: ${paymentIntentId}`);
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('external_transaction_id', paymentIntentId)
      .maybeSingle();
      
    if (error) {
      console.error(`[WEBHOOK] Error finding transaction by payment intent: ${error.message}`);
    }
    
    if (data) {
      console.log(`[WEBHOOK] Found transaction by payment intent: ${JSON.stringify({
        id: data.id,
        status: data.status,
        amount: data.amount
      })}`);
    } else {
      console.log(`[WEBHOOK] No transaction found with payment intent ID: ${paymentIntentId}`);
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
    const insertData = {
      user_id: session.metadata.user_id,
      amount: (session.amount_total / 100),
      wallet_address: session.metadata.wallet_address,
      payment_method: 'stripe',
      status: 'completed', // Explicitly set status to completed
      transaction_id: session.id,
      external_transaction_id: session.payment_intent || null,
      token_sent: false
    };
    
    console.log(`[WEBHOOK] Creating new transaction with data: ${JSON.stringify(insertData)}`);
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(insertData)
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
      .limit(10); // Increased limit to check more recent transactions
      
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
    } else {
      console.log('[WEBHOOK] No recent pending transactions found');
    }
    
    return data || [];
  } catch (err) {
    console.error(`[WEBHOOK] Error finding recent pending transactions: ${err.message}`);
    return [];
  }
};

// Check payment directly from Stripe
const verifyStripePaymentStatus = async (paymentIntentId, userId) => {
  if (!paymentIntentId) {
    console.log('[WEBHOOK] No payment intent ID provided for direct Stripe verification');
    return null;
  }
  
  try {
    console.log(`[WEBHOOK] Directly checking Stripe payment status for payment_intent: ${paymentIntentId}`);
    
    const stripe = createStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log(`[WEBHOOK] Direct Stripe payment check result: ${JSON.stringify({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      userId: userId
    })}`);
    
    return paymentIntent;
  } catch (err) {
    console.error(`[WEBHOOK] Error checking direct Stripe payment: ${err.message}`);
    return null;
  }
};

// Implement fallback direct check of Stripe payment status
const checkAndUpdatePayment = async (supabase, transaction) => {
  if (!transaction || !transaction.external_transaction_id) {
    console.log('[WEBHOOK] Cannot perform fallback check without transaction or payment intent ID');
    return null;
  }
  
  try {
    // Only run this for pending transactions
    if (transaction.status !== 'pending') {
      console.log(`[WEBHOOK] Skipping fallback check for non-pending transaction (status: ${transaction.status})`);
      return transaction;
    }
    
    console.log(`[WEBHOOK] Performing fallback payment verification for transaction: ${transaction.id}`);
    const paymentIntent = await verifyStripePaymentStatus(transaction.external_transaction_id, transaction.user_id);
    
    if (!paymentIntent) {
      console.log('[WEBHOOK] No payment data found in fallback check');
      return null;
    }
    
    // If Stripe shows payment is successful but our DB still shows pending, update it
    if (paymentIntent.status === 'succeeded' && transaction.status === 'pending') {
      console.log(`[WEBHOOK] FALLBACK: Stripe shows payment ${paymentIntent.id} is successful but DB shows pending. Updating status.`);
      
      const updatedTx = await updateTransactionStatus(supabase, transaction, transaction.external_transaction_id);
      
      // Create a notification for the user about the payment confirmation
      if (transaction.user_id) {
        await createPaymentConfirmationNotification(supabase, transaction.user_id, transaction.amount);
      }
      
      return updatedTx;
    } else {
      console.log(`[WEBHOOK] FALLBACK: No status update needed. Stripe: ${paymentIntent.status}, DB: ${transaction.status}`);
    }
    
    return transaction;
  } catch (err) {
    console.error(`[WEBHOOK] Error in fallback payment check: ${err.message}`);
    return transaction;
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
    metadata: session.metadata,
    payment_intent: session.payment_intent
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
      // Transaction exists, update it - regardless of current status
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
    
    // Verify database state after update attempt
    const { data: verifiedTx, error: verifyError } = await supabase
      .from('transactions')
      .select('*')
      .eq('transaction_id', session.id)
      .maybeSingle();
    
    if (verifyError) {
      console.error(`[WEBHOOK] Post-update verification error: ${verifyError.message}`);
    } else if (verifiedTx) {
      console.log(`[WEBHOOK] Post-update verification: Transaction ${verifiedTx.id} is now status=${verifiedTx.status}`);
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
      
      if (pendingTx) {
        // Update the transaction regardless of current status
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
        
        // Verify database state after update
        const { data: verifiedTx, error: verifyError } = await supabase
          .from('transactions')
          .select('id, status, updated_at')
          .eq('id', pendingTx.id)
          .single();
        
        if (verifyError) {
          console.error(`[WEBHOOK] Post-update verification error: ${verifyError.message}`);
        } else {
          console.log(`[WEBHOOK] Post-update verification: Transaction is now status=${verifiedTx.status}`);
        }
        
        return;
      } else {
        console.log(`[WEBHOOK] No transaction found with payment intent: ${paymentIntent.id}`);
        
        // Try to find by transaction_id in case external_transaction_id is not set
        const recentPendingTxs = await findRecentPendingTransactions(supabase);
        
        // Try to find by metadata if available
        if (paymentIntent.metadata?.session_id) {
          console.log(`[WEBHOOK] Trying to find transaction by session ID: ${paymentIntent.metadata.session_id}`);
          
          const sessionTx = await findTransactionBySessionId(supabase, paymentIntent.metadata.session_id);
          
          if (sessionTx) {
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
    
    // Verify the webhook signature using the ASYNC version
    let event;
    try {
      // Use the async verification method
      event = await verifyStripeSignatureAsync(body, signature);
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
    
    // Implement fallback check for all pending transactions with payment intents
    try {
      console.log('[WEBHOOK] Running pending transactions fallback check');
      const pendingTransactions = await findRecentPendingTransactions(supabaseClient);
      
      for (const tx of pendingTransactions) {
        if (tx.external_transaction_id) {
          await checkAndUpdatePayment(supabaseClient, tx);
        }
      }
    } catch (fallbackError) {
      console.error(`[WEBHOOK] Error in fallback check: ${fallbackError.message}`);
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
