
import Stripe from "https://esm.sh/stripe@14.21.0";
import { supabaseClient } from "../utils/supabaseClient.ts";

/**
 * Handle the checkout.session.completed webhook event
 */
export async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  
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
    const { data: existingCompletedTx, error: existingTxError } = await supabaseClient
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
    const { data: pendingTx, error: fetchError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('transaction_id', session.id)
      .maybeSingle();
      
    if (fetchError) {
      console.error(`[WEBHOOK] Error fetching transaction: ${fetchError.message}`);
      throw fetchError;
    }
    
    if (pendingTx) {
      // Transaction exists, update it
      console.log(`[WEBHOOK] Found transaction to update:`, JSON.stringify({
        id: pendingTx.id,
        status: pendingTx.status,
        amount: pendingTx.amount,
        wallet_address: pendingTx.wallet_address
      }));
      
      const { data: updatedTx, error: updateError } = await supabaseClient
        .from('transactions')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
          external_transaction_id: session.payment_intent || null,
          token_sent: false
        })
        .eq('transaction_id', session.id)
        .select()
        .single();
        
      if (updateError) {
        console.error(`[WEBHOOK] Error updating transaction: ${updateError.message}`);
        throw updateError;
      }
      
      console.log(`[WEBHOOK] Successfully updated transaction status for session ${session.id}`, 
        JSON.stringify({
          tx_id: updatedTx.id,
          new_status: updatedTx.status,
          payment_intent: session.payment_intent
        })
      );
      
      // Create a notification for the user
      await createUserNotification(pendingTx.user_id, session);
      
    } else {
      // If transaction doesn't exist, create it from webhook data
      await createTransactionFromWebhook(session);
    }
  } catch (updateError) {
    console.error(`[WEBHOOK] Exception in transaction update: ${updateError.message}`);
    console.error(updateError.stack || 'No stack trace available');
    throw updateError;
  }
}

/**
 * Create a notification for the user
 */
async function createUserNotification(userId: string, session: Stripe.Checkout.Session) {
  if (!userId) {
    console.log('[WEBHOOK] No user ID available for notification');
    return;
  }
  
  const { error: notificationError } = await supabaseClient
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: `Your payment of $${(session.amount_total! / 100).toFixed(2)} has been confirmed. Tokens will be sent to your wallet shortly.`
    });
    
  if (notificationError) {
    console.error(`[WEBHOOK] Error creating notification: ${notificationError.message}`);
  } else {
    console.log(`[WEBHOOK] Successfully created notification for user ${userId}`);
  }
}

/**
 * Create a new transaction from webhook data
 */
async function createTransactionFromWebhook(session: Stripe.Checkout.Session) {
  console.log(`[WEBHOOK] Transaction not found, attempting to create from webhook data`);
  
  if (session.metadata?.user_id && session.metadata?.wallet_address) {
    const { data: newTx, error: createError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: session.metadata.user_id,
        amount: (session.amount_total! / 100),
        wallet_address: session.metadata.wallet_address,
        payment_method: 'stripe',
        status: 'completed',
        transaction_id: session.id,
        external_transaction_id: session.payment_intent || null,
        token_sent: false
      })
      .select()
      .single();
      
    if (createError) {
      console.error(`[WEBHOOK] Error creating transaction from webhook: ${createError.message}`);
      throw createError;
    }
    
    console.log(`[WEBHOOK] Successfully created transaction record from webhook data`, JSON.stringify({
      tx_id: newTx.id,
      amount: newTx.amount,
      status: newTx.status
    }));
    
    // Create a notification for the user
    await createUserNotification(session.metadata.user_id, session);
    
  } else {
    console.error(`[WEBHOOK] Cannot create transaction record: missing user_id or wallet_address in metadata`, 
      JSON.stringify(session.metadata)
    );
  }
}
