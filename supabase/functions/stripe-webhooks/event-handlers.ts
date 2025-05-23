
// Import necessary dependencies
import { updateTransactionStatus } from "./transaction-ops.ts";
import { findTransactionBySessionId } from "./transaction-ops.ts";
import { createPaymentConfirmationNotification } from "./utils.ts";

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
    
    // Create enhanced payment confirmation notification
    await createEnhancedPaymentNotification(supabaseClient, transaction, 'stripe');
    
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
    
    // Create enhanced payment confirmation notification
    await createEnhancedPaymentNotification(supabaseClient, transaction, 'stripe');

    console.log(`[WEBHOOK] Successfully updated transaction status for payment intent: ${paymentIntent.id}`);
  } catch (error) {
    console.error(`[WEBHOOK] Error handling payment intent succeeded: ${error.message}`);
  }
};

// Handle crypto onramp session updated event
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
    
    // Check for 'fulfillment_complete' status as per latest Stripe API
    if (session.status === 'fulfillment_complete') {
      if (transaction.status === 'completed') {
        console.log(`[WEBHOOK] Transaction ${transaction.id} is already marked as completed`);
        return;
      }
      
      // Update the transaction status
      await updateTransactionStatus(supabaseClient, transaction);
      
      // Create enhanced payment confirmation notification
      await createEnhancedPaymentNotification(supabaseClient, transaction, 'crypto');
      
      console.log(`[WEBHOOK] Successfully updated transaction status for crypto onramp session: ${session.id}`);
    } else {
      console.log(`[WEBHOOK] No action taken for crypto onramp session with status: ${session.status}`);
    }
  } catch (error) {
    console.error(`[WEBHOOK] Error handling crypto onramp session updated: ${error.message}`);
  }
};

// Enhanced notification creation function
async function createEnhancedPaymentNotification(supabaseClient, transaction, paymentMethod) {
  try {
    console.log(`[WEBHOOK] Creating enhanced payment notification for transaction ${transaction.id}`);
    
    const amount = Number(transaction.amount) || 0;
    const methodName = paymentMethod === 'stripe' ? 'card' : 'cryptocurrency';
    
    const { error: notifError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: transaction.user_id,
        type: 'payment',
        title: 'Payment Confirmed',
        message: `Your ${methodName} payment of $${amount.toFixed(2)} has been successfully processed. Your CSI tokens will be sent to your wallet shortly.`,
        read: false,
        is_test: transaction.is_test || false
      });
      
    if (notifError) {
      console.error(`[WEBHOOK] Error creating payment notification: ${notifError.message}`);
    } else {
      console.log(`[WEBHOOK] Successfully created payment notification for user ${transaction.user_id}`);
    }
  } catch (error) {
    console.error(`[WEBHOOK] Error in createEnhancedPaymentNotification: ${error.message}`);
  }
}
