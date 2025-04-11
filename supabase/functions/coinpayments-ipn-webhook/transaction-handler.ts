
import { createDbClient } from "./db-client.ts";

// Process CoinPayments IPN payload and update transaction status
export async function processIpnPayload(payload: Record<string, string>, logEntryId?: string) {
  try {
    console.log(`Processing IPN payload for transaction ${payload.txn_id}, ipn_type: ${payload.ipn_type}`);
    
    // Create Supabase client
    const supabase = createDbClient();
    
    // Update the log entry with payload details if available
    if (logEntryId) {
      await supabase
        .from('ipn_logs')
        .update({
          txn_id: payload.txn_id,
          status: payload.status || null,
          processing_status: 'processing',
          details: JSON.stringify(payload)
        })
        .eq('id', logEntryId);
    }
    
    // Only process API type IPN messages for now
    if (payload.ipn_type !== 'api') {
      console.log(`Skipping non-API IPN type: ${payload.ipn_type}`);
      return { success: true, message: `IPN type ${payload.ipn_type} logged but not processed` };
    }
    
    // Find transaction by external transaction ID
    console.log(`Looking for transaction with external_transaction_id: ${payload.txn_id}`);
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('external_transaction_id', payload.txn_id)
      .maybeSingle();
      
    if (txError) {
      console.error(`Error fetching transaction: ${txError.message}`);
      
      // Update log with error
      if (logEntryId) {
        await supabase
          .from('ipn_logs')
          .update({
            processing_status: 'error',
            error_message: `DB error: ${txError.message}`,
            processed_at: new Date().toISOString()
          })
          .eq('id', logEntryId);
      }
      
      return { 
        success: false, 
        message: `Database error: ${txError.message}` 
      };
    }
    
    // If no transaction found, try backup lookup methods
    if (!transaction) {
      console.warn(`No transaction found with external_transaction_id: ${payload.txn_id}`);
      
      // Try looking up by payment_address if available
      if (payload.address) {
        console.log(`Trying to find transaction by payment_address: ${payload.address}`);
        const { data: addrTransaction, error: addrError } = await supabase
          .from('transactions')
          .select('*')
          .eq('payment_address', payload.address)
          .maybeSingle();
          
        if (!addrError && addrTransaction) {
          console.log(`Found transaction by payment_address: ${addrTransaction.id}`);
          
          // Update with external_transaction_id since we now know it
          await supabase
            .from('transactions')
            .update({
              external_transaction_id: payload.txn_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', addrTransaction.id);
            
          // Continue processing with this transaction
          return await updateTransactionStatus(
            supabase, 
            addrTransaction, 
            payload, 
            logEntryId
          );
        }
      }
      
      // Log transaction not found
      if (logEntryId) {
        await supabase
          .from('ipn_logs')
          .update({
            processing_status: 'error',
            error_message: `Transaction not found for external_transaction_id: ${payload.txn_id}`,
            processed_at: new Date().toISOString()
          })
          .eq('id', logEntryId);
      }
      
      return { 
        success: false, 
        message: `Transaction not found for txn_id: ${payload.txn_id}` 
      };
    }
    
    // Process the found transaction
    return await updateTransactionStatus(supabase, transaction, payload, logEntryId);
    
  } catch (error) {
    console.error(`Error processing IPN payload: ${error.message}`);
    
    return { 
      success: false, 
      message: `Exception: ${error.message}` 
    };
  }
}

async function updateTransactionStatus(
  supabase: any, 
  transaction: any, 
  payload: Record<string, string>,
  logEntryId?: string
) {
  try {
    console.log(`Updating transaction ${transaction.id} with status from IPN`);
    
    // Map CoinPayments status to our status format
    const statusCode = parseInt(payload.status, 10) || -1;
    let newStatus = 'pending';
    
    // Complete status mapping
    if (statusCode < 0) {
      newStatus = 'failed';
    } else if (statusCode === 0) {
      newStatus = 'pending';
    } else if (statusCode >= 100) {
      newStatus = 'completed';
    } else if (statusCode >= 1) {
      newStatus = 'confirmed'; // Partial confirmation
    }
    
    console.log(`Mapped CoinPayments status ${statusCode} to: ${newStatus}`);
    
    // If status is the same, no need to update
    if (transaction.status === newStatus) {
      console.log(`Transaction ${transaction.id} already has status ${newStatus}, no update needed`);
      
      // Still update the log entry
      if (logEntryId) {
        await supabase
          .from('ipn_logs')
          .update({
            processing_status: 'success',
            processed_at: new Date().toISOString(),
            details: JSON.stringify({
              transaction_id: transaction.id,
              status: newStatus,
              external_status: statusCode,
              no_change: true
            })
          })
          .eq('id', logEntryId);
      }
      
      return { 
        success: true, 
        message: `Transaction ${transaction.id} already has status ${newStatus}, no update needed`,
        transaction_id: transaction.id,
        status: newStatus,
        external_status: statusCode,
        updated: false
      };
    }
    
    // Prepare update data
    const updateData: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    // Set completed_at timestamp if status is completed or confirmed
    if (newStatus === 'completed' || newStatus === 'confirmed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    // Update transaction status
    const { error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transaction.id);
      
    if (updateError) {
      console.error(`Error updating transaction: ${updateError.message}`);
      
      // Update log with error
      if (logEntryId) {
        await supabase
          .from('ipn_logs')
          .update({
            processing_status: 'error',
            error_message: `Update error: ${updateError.message}`,
            processed_at: new Date().toISOString()
          })
          .eq('id', logEntryId);
      }
      
      return { 
        success: false, 
        message: `Error updating transaction: ${updateError.message}`,
        transaction_id: transaction.id
      };
    }
    
    console.log(`Successfully updated transaction ${transaction.id} status from ${transaction.status} to ${newStatus}`);
    
    // Add a notification for the user
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: transaction.user_id,
        type: 'payment_' + newStatus,
        title: `Payment ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        message: `Your cryptocurrency payment of $${transaction.amount} has been ${newStatus}. ${newStatus === 'completed' ? 'Tokens will be sent to your wallet shortly.' : ''}`
      });
      
    if (notifError) {
      console.warn(`Error creating notification: ${notifError.message}`);
    }
    
    // Update log entry
    if (logEntryId) {
      await supabase
        .from('ipn_logs')
        .update({
          processing_status: 'success',
          processed_at: new Date().toISOString(),
          details: JSON.stringify({
            transaction_id: transaction.id,
            old_status: transaction.status,
            new_status: newStatus,
            external_status: statusCode
          })
        })
        .eq('id', logEntryId);
    }
    
    return { 
      success: true, 
      message: `Transaction ${transaction.id} status updated from ${transaction.status} to ${newStatus}`,
      transaction_id: transaction.id,
      old_status: transaction.status,
      new_status: newStatus,
      external_status: statusCode,
      updated: true
    };
  } catch (error) {
    console.error(`Error in updateTransactionStatus: ${error.message}`);
    return { 
      success: false, 
      message: `Exception in updateTransactionStatus: ${error.message}`,
      transaction_id: transaction.id
    };
  }
}
