
import { createPaymentConfirmationNotification } from "./utils.ts";
import { 
  updateTransactionStatus, 
  findTransactionBySessionId, 
  createTransactionFromSession,
  findTransactionByPaymentIntent 
} from "./transaction-ops.ts";
import { findRecentPendingTransactions } from "./utils.ts";
import { checkAndUpdatePayment } from "./stripe-ops.ts";

// Handle checkout.session.completed event
export const handleCheckoutSessionCompleted = async (supabase: any, session: any) => {
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
export const handlePaymentIntentSucceeded = async (supabase: any, paymentIntent: any) => {
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
