
import { createPaymentConfirmationNotification } from "./notification.ts";

// Update transaction status in Supabase with retry logic
export async function updateTransactionStatus(
  client: any,
  externalTxId: string,
  status: string,
  ipnStatus: number,
  completedAt?: string,
  maxRetries = 3
) {
  let retries = 0;
  let success = false;

  while (retries < maxRetries && !success) {
    try {
      console.log(`Updating transaction with external ID ${externalTxId} to status: ${status} (attempt ${retries + 1})`);
      
      const updateData: Record<string, any> = {
        status: status,
        external_status: ipnStatus, // Store the original status code from CoinPayments
        updated_at: new Date().toISOString()
      };
      
      if (completedAt) {
        updateData.completed_at = completedAt;
      }
      
      // First, find the transaction by external_transaction_id
      const { data: transaction, error: findError } = await client
        .from('transactions')
        .select('id, status')
        .eq('external_transaction_id', externalTxId)
        .single();
        
      if (findError || !transaction) {
        console.error(`Error finding transaction with external ID ${externalTxId}:`, findError);
        retries++;
        if (retries < maxRetries) await new Promise(r => setTimeout(r, 1000 * retries)); // Exponential backoff
        continue;
      }
      
      // Only update if status has changed
      if (transaction.status !== status) {
        const { error: updateError } = await client
          .from('transactions')
          .update(updateData)
          .eq('id', transaction.id);
          
        if (updateError) {
          console.error(`Error updating transaction ${transaction.id}:`, updateError);
          retries++;
          if (retries < maxRetries) await new Promise(r => setTimeout(r, 1000 * retries)); // Exponential backoff
          continue;
        }
        
        console.log(`Successfully updated transaction ${transaction.id} status from ${transaction.status} to ${status}`);
        
        // If transaction is completed, create a notification for the user
        if (status === 'completed' && transaction.status !== 'completed') {
          try {
            // Get transaction details to find user_id and amount
            const { data: txDetails, error: txError } = await client
              .from('transactions')
              .select('user_id, amount')
              .eq('id', transaction.id)
              .single();
              
            if (!txError && txDetails) {
              await createPaymentConfirmationNotification(client, txDetails.user_id, txDetails.amount);
            }
          } catch (notifError) {
            console.error('Error creating notification:', notifError);
            // Don't retry for notification errors - the transaction update is more important
          }
        }
        
        success = true;
        return true;
      } else {
        console.log(`Transaction ${transaction.id} already has status ${status}, no update needed`);
        success = true;
        return false; // No changes made
      }
    } catch (error) {
      console.error('Error in updateTransactionStatus:', error);
      retries++;
      if (retries < maxRetries) await new Promise(r => setTimeout(r, 1000 * retries)); // Exponential backoff
    }
  }
  
  return success;
}
