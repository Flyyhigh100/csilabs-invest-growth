
import { createDbClient } from "./db-client.ts";
import { mapCoinPaymentsStatus } from "./status-mapper.ts";
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
      console.log(`Original IPN status code: ${ipnStatus}`);
      
      const updateData: Record<string, any> = {
        status: status,
        external_status: ipnStatus, // Store the original status code from CoinPayments
        updated_at: new Date().toISOString()
      };
      
      // Only try to set completed_at if it was provided
      if (completedAt) {
        try {
          updateData.completed_at = completedAt;
        } catch (e) {
          console.log("Note: completed_at column may not exist yet, continuing without it");
        }
      }
      
      // First, find the transaction by external_transaction_id
      const { data: transaction, error: findError } = await client
        .from('transactions')
        .select('id, status, user_id, amount, payment_address')
        .eq('external_transaction_id', externalTxId)
        .single();
        
      if (findError || !transaction) {
        console.error(`Error finding transaction with external ID ${externalTxId}:`, findError);
        retries++;
        if (retries < maxRetries) await new Promise(r => setTimeout(r, 1000 * retries)); // Exponential backoff
        continue;
      }
      
      console.log(`Found transaction: ID=${transaction.id}, Current status=${transaction.status}, New status=${status}`);
      
      // Only update if status has changed or forcing an update from status 1 or 100
      if (transaction.status !== status || (ipnStatus === 1 || ipnStatus >= 100)) {
        // Try update with the current data
        let updateResult = await client
          .from('transactions')
          .update(updateData)
          .eq('id', transaction.id);
          
        // If there was an error and it mentions completed_at, retry without that field
        if (updateResult.error && updateResult.error.message && 
            updateResult.error.message.includes('completed_at')) {
          
          console.log("Error with completed_at field, retrying without it");
          delete updateData.completed_at;
          
          updateResult = await client
            .from('transactions')
            .update(updateData)
            .eq('id', transaction.id);
        }
        
        // Check final result
        if (updateResult.error) {
          console.error(`Error updating transaction ${transaction.id}:`, updateResult.error);
          retries++;
          if (retries < maxRetries) await new Promise(r => setTimeout(r, 1000 * retries)); // Exponential backoff
          continue;
        }
        
        console.log(`Successfully updated transaction ${transaction.id} status from ${transaction.status} to ${status}`);
        
        // If transaction is confirmed or completed, create a notification for the user
        if ((status === 'completed' || status === 'confirmed') && 
            (transaction.status !== 'completed' && transaction.status !== 'confirmed')) {
          try {
            // We already have user_id and amount from the initial query
            if (transaction.user_id && transaction.amount) {
              await createPaymentConfirmationNotification(
                client, 
                transaction.user_id, 
                transaction.amount
              );
              console.log(`Created notification for user ${transaction.user_id}`);
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

// Process IPN payload and update transaction status
export async function processIpnPayload(payload: Record<string, string>, logEntryId?: string) {
  console.log(`Processing IPN payload. IPN type: ${payload.ipn_type}, TXN ID: ${payload.txn_id}`);
  
  try {
    if (payload.ipn_type !== 'api') {
      console.log(`Ignoring IPN with type ${payload.ipn_type} - we only care about api IPNs`);
      return { 
        success: true, 
        message: `Ignoring IPN with type ${payload.ipn_type}`,
        status: 'ignored'
      };
    }
    
    // Validate required fields
    if (!payload.txn_id) {
      throw new Error('Missing txn_id in IPN payload');
    }
    
    if (payload.status === undefined) {
      throw new Error('Missing status in IPN payload');
    }
    
    // Parse the status code
    const statusCode = parseInt(payload.status, 10);
    
    // Map CoinPayments status to our internal status
    const status = mapCoinPaymentsStatus(statusCode);
    console.log(`Mapped CoinPayments status ${statusCode} to internal status: ${status}`);
    
    // Update database record
    const dbClient = createDbClient();
    
    // Check for completed status and set completed_at timestamp if needed
    const completedAt = (statusCode === 1 || statusCode >= 100) ? new Date().toISOString() : undefined;
    
    // Update the transaction status
    const updated = await updateTransactionStatus(
      dbClient,
      payload.txn_id,
      status,
      statusCode,
      completedAt
    );
    
    // Update IPN log with the processed status
    if (logEntryId) {
      try {
        await dbClient
          .from('ipn_logs')
          .update({
            txn_id: payload.txn_id,
            status: status,
            raw_data: payload,
            is_valid: true,
            response_status: updated ? 'Updated' : 'No update needed',
            processed_at: new Date().toISOString()
          })
          .eq('id', logEntryId);
      } catch (logError) {
        console.error('Error updating IPN log:', logError);
      }
    }
    
    return {
      success: true,
      message: updated 
        ? `Successfully updated transaction ${payload.txn_id} to status ${status}`
        : `Transaction ${payload.txn_id} already has status ${status}, no update needed`,
      updated,
      status
    };
  } catch (error) {
    console.error('Error processing IPN payload:', error);
    
    // Try to update the log entry with error info
    if (logEntryId) {
      try {
        const dbClient = createDbClient();
        await dbClient
          .from('ipn_logs')
          .update({
            raw_data: { error: error.message, payload },
            response_status: `Error: ${error.message}`,
            processed_at: new Date().toISOString()
          })
          .eq('id', logEntryId);
      } catch (logError) {
        console.error('Error updating IPN log with error info:', logError);
      }
    }
    
    return {
      success: false,
      message: `Error processing IPN: ${error.message}`,
      error: error.message
    };
  }
}
