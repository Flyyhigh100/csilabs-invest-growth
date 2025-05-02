// Import necessary dependencies
import { updateTransactionStatus } from "./transaction-ops.ts";
import { findTransactionBySessionId } from "./transaction-ops.ts";

// Handle checkout session completed event
export const handleCheckoutSessionCompleted = async (supabaseClient, session) => {
  console.log(`[WEBHOOK] Processing checkout.session.completed event for session: ${session.id}`);
  
  try {
    // Find the transaction in our database
    const transaction = await findTransactionBySessionId(supabaseClient, session.id);
    
    if (!transaction) {
      console.error(`[WEBHOOK] No transaction found for session ID: ${session.id}`);
      return;
    }
    
    if (transaction.status === 'completed') {
      console.log(`[WEBHOOK] Transaction ${transaction.id} is already marked as completed`);
      return;
    }
    
    // Update the transaction status
    await updateTransactionStatus(supabaseClient, transaction, session.payment_intent);
    
    console.log(`[WEBHOOK] Successfully updated transaction status for checkout session: ${session.id}`);
  } catch (error) {
    console.error(`[WEBHOOK] Error handling checkout session completed: ${error.message}`);
  }
};

// Handle payment intent succeeded event
export const handlePaymentIntentSucceeded = async (supabaseClient, paymentIntent) => {
  console.log(`[WEBHOOK] Processing payment_intent.succeeded event for: ${paymentIntent.id}`);

  try {
    // Find the transaction by payment intent ID
    const transaction = await findTransactionBySessionId(supabaseClient, paymentIntent.id);

    if (!transaction) {
      console.error(`[WEBHOOK] No transaction found for payment intent ID: ${paymentIntent.id}`);
      return;
    }

    if (transaction.status === 'completed') {
      console.log(`[WEBHOOK] Transaction ${transaction.id} is already marked as completed`);
      return;
    }

    // Update the transaction status
    await updateTransactionStatus(supabaseClient, transaction, paymentIntent.id);

    console.log(`[WEBHOOK] Successfully updated transaction status for payment intent: ${paymentIntent.id}`);
  } catch (error) {
    console.error(`[WEBHOOK] Error handling payment intent succeeded: ${error.message}`);
  }
};

// Handle crypto onramp session updated event (new handler)
export const handleCryptoOnrampSessionUpdated = async (supabaseClient, session) => {
  console.log(`[WEBHOOK] Processing crypto.onramp_session.updated event for session: ${session.id}`);
  console.log(`[WEBHOOK] Session status: ${session.status}`);
  
  try {
    // Find the transaction in our database
    const transaction = await findTransactionBySessionId(supabaseClient, session.id);
    
    if (!transaction) {
      console.error(`[WEBHOOK] No transaction found for crypto onramp session ID: ${session.id}`);
      return;
    }
    
    // Only update status if the session is fulfilled
    if (session.status === 'fulfilled') {
      if (transaction.status === 'completed') {
        console.log(`[WEBHOOK] Transaction ${transaction.id} is already marked as completed`);
        return;
      }
      
      // Update the transaction status
      await updateTransactionStatus(supabaseClient, transaction);
      
      // Create a notification for the user
      const { error: notifError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: transaction.user_id,
          type: 'payment_confirmed',
          title: 'Crypto Purchase Confirmed',
          message: `Your crypto purchase of $${transaction.amount.toFixed(2)} has been confirmed.`
        });
        
      if (notifError) {
        console.error(`[WEBHOOK] Error creating notification: ${notifError.message}`);
      }
      
      console.log(`[WEBHOOK] Successfully updated transaction status for crypto onramp session: ${session.id}`);
    } else {
      console.log(`[WEBHOOK] No action taken for crypto onramp session with status: ${session.status}`);
    }
  } catch (error) {
    console.error(`[WEBHOOK] Error handling crypto onramp session updated: ${error.message}`);
  }
};
