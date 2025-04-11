
import { createStripeClient } from "./clients.ts";
import { updateTransactionStatus } from "./transaction-ops.ts";
import { createPaymentConfirmationNotification } from "./utils.ts";

// Check payment directly from Stripe
export const verifyStripePaymentStatus = async (paymentIntentId: string, userId: string) => {
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
export const checkAndUpdatePayment = async (supabase: any, transaction: any) => {
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
