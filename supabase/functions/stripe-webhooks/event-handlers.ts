
import { createPaymentConfirmationNotification } from "./utils.ts";
import { 
  updateTransactionStatus, 
  findTransactionBySessionId, 
  createTransactionFromSession,
  findTransactionByPaymentIntent,
  forceUpdateExternalTransactionId
} from "./transaction-ops.ts";
import { findRecentPendingTransactions } from "./utils.ts";
import { checkAndUpdatePayment } from "./stripe-ops.ts";

// Handle checkout.session.completed event
export const handleCheckoutSessionCompleted = async (supabase: any, session: any) => {
  // Add CRITICAL logging for debugging
  console.log('[CRITICAL] Processing checkout session:', JSON.stringify({
    id: session.id,
    payment_intent: session.payment_intent,
    payment_status: session.payment_status,
    mode: session.mode
  }));
  
  // Skip if not a payment or payment not successful
  if (session.mode !== 'payment' || session.payment_status !== 'paid') {
    console.log('[WEBHOOK] Not a completed payment, skipping');
    return;
  }
  
  // CRITICAL CHECK: Confirm payment_intent exists
  if (!session.payment_intent) {
    console.error('[CRITICAL] Session has no payment_intent field:', session.id);
    return;
  }
  
  console.log(`[CRITICAL] Processing completed payment for session: ${session.id} with payment_intent: ${session.payment_intent}`);
  
  try {
    // First, check if we already processed this session to prevent duplicates
    const { data: existingCompletedTx, error: existingTxError } = await supabase
      .from('transactions')
      .select('id, status, external_transaction_id')
      .eq('transaction_id', session.id)
      .eq('status', 'completed')
      .maybeSingle();
      
    if (existingCompletedTx) {
      console.log(`[WEBHOOK] Session ${session.id} already marked as completed`);
      
      // Ensure the external_transaction_id is set even if already completed
      if (session.payment_intent && !existingCompletedTx.external_transaction_id) {
        console.log(`[CRITICAL] Updating missing payment intent ID for completed transaction: ${existingCompletedTx.id}`);
        
        // Use our force update method instead of regular update
        const updated = await forceUpdateExternalTransactionId(
          supabase, 
          existingCompletedTx.id,
          session.payment_intent
        );
        
        if (updated) {
          console.log(`[CRITICAL] Successfully force-updated external_transaction_id for existing completed transaction`);
        }
      }
      
      return;
    }
    
    // Retrieve the transaction using the session ID
    const pendingTx = await findTransactionBySessionId(supabase, session.id);
    
    if (pendingTx) {
      console.log(`[CRITICAL] Found transaction to update: ${pendingTx.id} with payment_intent: ${session.payment_intent}`);
      
      // DIRECT APPROACH: Use the force update method to ensure external_transaction_id is updated
      const updated = await forceUpdateExternalTransactionId(
        supabase,
        pendingTx.id,
        session.payment_intent
      );
      
      if (updated) {
        console.log(`[CRITICAL] Successfully force-updated external_transaction_id for transaction ${pendingTx.id}`);
        
        // Create a notification for the user
        if (pendingTx.user_id) {
          await createPaymentConfirmationNotification(supabase, pendingTx.user_id, (session.amount_total / 100).toFixed(2));
        }
      } else {
        console.error(`[CRITICAL] Force update failed for transaction ${pendingTx.id}`);
        
        // Fall back to the standard update method
        console.log(`[CRITICAL] Trying fallback to standard update method`);
        const fallbackUpdate = await updateTransactionStatus(supabase, pendingTx, session.payment_intent);
        
        if (fallbackUpdate) {
          console.log(`[CRITICAL] Standard update succeeded as fallback`);
          // Create a notification for the user
          if (pendingTx.user_id) {
            await createPaymentConfirmationNotification(supabase, pendingTx.user_id, (session.amount_total / 100).toFixed(2));
          }
        } else {
          console.error(`[CRITICAL] All update attempts failed for transaction ${pendingTx.id}`);
        }
      }
    } else {
      // No existing transaction found
      console.log(`[WEBHOOK] Transaction not found for session ${session.id}, attempting to create from webhook data`);
      
      // IMPORTANT: Always include payment_intent when creating from session
      const newTx = await createTransactionFromSession(supabase, session);
      
      // Create a notification for the user if transaction was created
      if (newTx && session.metadata?.user_id) {
        await createPaymentConfirmationNotification(supabase, session.metadata.user_id, (session.amount_total / 100).toFixed(2));
      }
    }
    
  } catch (error) {
    console.error(`[CRITICAL] Error processing checkout session: ${error.message}`);
    console.error(error.stack || 'No stack trace available');
  }
};

// Handle payment_intent.succeeded event
export const handlePaymentIntentSucceeded = async (supabase: any, paymentIntent: any) => {
  // Add CRITICAL logging for payment intent details
  console.log(`[CRITICAL] PaymentIntent ${paymentIntent.id} was successful!`, JSON.stringify({
    id: paymentIntent.id,
    status: paymentIntent.status,
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
        console.log(`[CRITICAL] Found transaction by payment intent, updating to completed:`, JSON.stringify({
          tx_id: pendingTx.id,
          current_status: pendingTx.status,
          amount: pendingTx.amount
        }));
        
        // Use our force update method to ensure external_transaction_id is set
        const updated = await forceUpdateExternalTransactionId(
          supabase,
          pendingTx.id,
          paymentIntent.id
        );
        
        if (updated) {
          console.log(`[CRITICAL] Successfully force-updated transaction ${pendingTx.id} with payment intent ${paymentIntent.id}`);
          
          // Create a notification for the user
          if (pendingTx.user_id) {
            await createPaymentConfirmationNotification(supabase, pendingTx.user_id, pendingTx.amount);
          }
        } else {
          console.error(`[CRITICAL] Force update failed for transaction ${pendingTx.id} in payment_intent handler`);
          
          // Fall back to direct Supabase update as a last resort
          const updateData = {
            status: 'completed',
            external_transaction_id: paymentIntent.id,
            updated_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          };
          
          const { data, error } = await supabase
            .from('transactions')
            .update(updateData)
            .eq('id', pendingTx.id)
            .select()
            .single();
            
          if (error) {
            console.error(`[CRITICAL] Even direct update failed: ${error.message}`);
          } else {
            console.log(`[CRITICAL] Direct update succeeded as fallback`);
            
            // Create a notification for the user
            if (pendingTx.user_id) {
              await createPaymentConfirmationNotification(supabase, pendingTx.user_id, pendingTx.amount);
            }
          }
        }
        
        return;
      }

      // If not found by payment intent, try other methods
      console.log(`[CRITICAL] No transaction found with payment intent: ${paymentIntent.id}`);
      
      // Try to find by metadata if available
      if (paymentIntent.metadata?.session_id) {
        console.log(`[CRITICAL] Trying to find transaction by session ID: ${paymentIntent.metadata.session_id}`);
        
        const sessionTx = await findTransactionBySessionId(supabase, paymentIntent.metadata.session_id);
        
        if (sessionTx) {
          console.log(`[CRITICAL] Found transaction by session ID, updating status:`, JSON.stringify({
            tx_id: sessionTx.id,
            current_status: sessionTx.status
          }));
          
          // Use our force update method
          const updated = await forceUpdateExternalTransactionId(
            supabase,
            sessionTx.id,
            paymentIntent.id
          );
          
          if (updated) {
            console.log(`[CRITICAL] Successfully force-updated transaction found by session ID`);
            
            // Create a notification for the user
            if (sessionTx.user_id) {
              await createPaymentConfirmationNotification(supabase, sessionTx.user_id, sessionTx.amount);
            }
          } else {
            console.error(`[CRITICAL] Force update failed for transaction found by session ID`);
          }
        } else {
          console.log(`[CRITICAL] No transaction found by session ID: ${paymentIntent.metadata.session_id}`);
        }
      } else {
        console.log(`[CRITICAL] Payment intent has no session_id in metadata, cannot find transaction`);
      }
      
      // Look for ANY pending transaction that might match by wallet address or amount
      console.log(`[CRITICAL] Searching for any pending transactions that might match this payment...`);
      
      const recentPendingTxs = await findRecentPendingTransactions(supabase);
      if (recentPendingTxs.length > 0) {
        console.log(`[CRITICAL] Found ${recentPendingTxs.length} recent pending transactions, checking if any match...`);
        
        // If we have only ONE pending transaction and the payment amount matches within 1 cent, force update it
        if (recentPendingTxs.length === 1) {
          const pendingTx = recentPendingTxs[0];
          const pendingAmount = pendingTx.amount;
          const paymentAmount = paymentIntent.amount / 100; // Stripe amounts are in cents
          
          console.log(`[CRITICAL] Comparing pending transaction amount ${pendingAmount} with payment amount ${paymentAmount}`);
          
          if (Math.abs(pendingAmount - paymentAmount) < 0.01) {
            console.log(`[CRITICAL] Found matching pending transaction by amount: ${pendingTx.id}`);
            
            // Use our force update method
            const updated = await forceUpdateExternalTransactionId(
              supabase,
              pendingTx.id,
              paymentIntent.id
            );
            
            if (updated) {
              console.log(`[CRITICAL] Successfully force-updated transaction found by amount match`);
              
              // Create a notification for the user
              if (pendingTx.user_id) {
                await createPaymentConfirmationNotification(supabase, pendingTx.user_id, pendingTx.amount);
              }
            }
          }
        }
      } else {
        console.log(`[CRITICAL] No recent pending transactions found to match against`);
      }
    } else {
      console.error(`[CRITICAL] Payment intent has no ID, cannot process`);
    }
  } catch (err) {
    console.error(`[CRITICAL] Error processing payment intent: ${err.message}`);
    console.error(err.stack || 'No stack trace available');
  }
};
