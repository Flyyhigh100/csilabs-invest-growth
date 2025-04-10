
import Stripe from "https://esm.sh/stripe@14.21.0";
import { supabaseClient } from "../utils/supabaseClient.ts";

/**
 * Handle the payment_intent.succeeded webhook event
 */
export async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  console.log(`[WEBHOOK] PaymentIntent ${paymentIntent.id} was successful!`, JSON.stringify({
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    metadata: paymentIntent.metadata
  }));
  
  // Try to find transaction by payment_intent ID if we have it
  if (paymentIntent.id) {
    try {
      // First check by external_transaction_id field
      const { data: pendingTx, error: fetchError } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('external_transaction_id', paymentIntent.id)
        .maybeSingle();
        
      if (fetchError) {
        console.error(`[WEBHOOK] Error finding transaction by payment intent: ${fetchError.message}`);
      }
        
      if (pendingTx && pendingTx.status !== 'completed') {
        await updateTransactionToCompleted(pendingTx);
      } else if (pendingTx) {
        console.log(`[WEBHOOK] Transaction already marked as completed: ${pendingTx.id}`);
      } else {
        console.log(`[WEBHOOK] No transaction found with payment intent: ${paymentIntent.id}`);
        await findTransactionBySessionId(paymentIntent);
      }
    } catch (err) {
      console.error(`[WEBHOOK] Error processing payment intent: ${err.message}`);
      throw err;
    }
  }
}

/**
 * Update transaction status to completed
 */
async function updateTransactionToCompleted(pendingTx: any) {
  console.log(`[WEBHOOK] Found transaction by payment intent, updating to completed:`, JSON.stringify({
    tx_id: pendingTx.id,
    current_status: pendingTx.status,
    amount: pendingTx.amount
  }));
  
  const { error: updateError } = await supabaseClient
    .from('transactions')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', pendingTx.id);
    
  if (updateError) {
    console.error(`[WEBHOOK] Error updating transaction from payment intent: ${updateError.message}`);
  } else {
    console.log(`[WEBHOOK] Successfully updated transaction from payment intent: ${pendingTx.external_transaction_id}`);
    
    // Create a notification for the user
    if (pendingTx.user_id) {
      await createPaymentNotification(pendingTx);
    }
  }
}

/**
 * Create a payment notification
 */
async function createPaymentNotification(pendingTx: any) {
  const { error: notificationError } = await supabaseClient
    .from('notifications')
    .insert({
      user_id: pendingTx.user_id,
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: `Your payment of $${pendingTx.amount.toFixed(2)} has been confirmed. Tokens will be sent to your wallet shortly.`
    });
    
  if (notificationError) {
    console.error(`[WEBHOOK] Error creating notification: ${notificationError.message}`);
  } else {
    console.log(`[WEBHOOK] Successfully created notification for user ${pendingTx.user_id}`);
  }
}

/**
 * Find a transaction by session ID stored in payment intent metadata
 */
async function findTransactionBySessionId(paymentIntent: Stripe.PaymentIntent) {
  if (!paymentIntent.metadata?.session_id) {
    return;
  }
  
  console.log(`[WEBHOOK] Trying to find transaction by session ID: ${paymentIntent.metadata.session_id}`);
  
  const { data: sessionTx, error: sessionFetchError } = await supabaseClient
    .from('transactions')
    .select('*')
    .eq('transaction_id', paymentIntent.metadata.session_id)
    .maybeSingle();
  
  if (sessionFetchError) {
    console.error(`[WEBHOOK] Error finding transaction by session ID: ${sessionFetchError.message}`);
  } else if (sessionTx && sessionTx.status !== 'completed') {
    console.log(`[WEBHOOK] Found transaction by session ID, updating status:`, JSON.stringify({
      tx_id: sessionTx.id,
      current_status: sessionTx.status
    }));
    
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({
        status: 'completed',
        external_transaction_id: paymentIntent.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionTx.id);
      
    if (updateError) {
      console.error(`[WEBHOOK] Error updating transaction by session ID: ${updateError.message}`);
    } else {
      console.log(`[WEBHOOK] Successfully updated transaction by session ID: ${paymentIntent.metadata.session_id}`);
    }
  }
}
