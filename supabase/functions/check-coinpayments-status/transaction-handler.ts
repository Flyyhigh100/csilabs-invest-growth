
import { createDbClient } from "./db-client.ts";
import { mapCoinPaymentsStatus, getStatusDescription } from "./status-mapper.ts";
import { createPaymentConfirmationNotification, createPaymentFailedNotification } from "./notification.ts";

export async function processIpnPayload(ipnData: any, logEntryId?: string) {
  console.log("Processing IPN payload:", JSON.stringify(ipnData));
  
  try {
    // Validate required fields
    if (!ipnData.ipn_type) {
      console.error("Missing ipn_type in IPN data");
      return { success: false, message: "Missing ipn_type field" };
    }
    
    if (ipnData.ipn_type !== 'api' && ipnData.ipn_type !== 'button') {
      console.log(`Ignoring IPN with type ${ipnData.ipn_type} (only handling 'api' and 'button' types)`);
      return { success: true, message: `IPN type ${ipnData.ipn_type} not handled` };
    }
    
    if (!ipnData.txn_id) {
      console.error("Missing txn_id in IPN data");
      return { success: false, message: "Missing txn_id field" };
    }

    // Extract status code from IPN data
    const status = parseInt(ipnData.status || '0');
    const txnId = ipnData.txn_id;

    console.log(`Processing IPN for transaction ${txnId} with status ${status}`);
    
    const supabase = createDbClient();

    // Enhanced transaction lookup strategy with detailed logging
    console.log(`Looking for transaction with external_transaction_id=${txnId}`);

    let transaction;
    
    // Try looking up by external_transaction_id first
    const { data: extIdTx, error: extIdError } = await supabase
      .from('transactions')
      .select('*')
      .eq('external_transaction_id', txnId)
      .maybeSingle();
      
    if (extIdTx) {
      console.log('Found transaction by external_transaction_id');
      transaction = extIdTx;
    } else {
      // If not found, try transaction_id
      const { data: txIdTx, error: txIdError } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_id', txnId)
        .maybeSingle();
        
      if (txIdTx) {
        console.log('Found transaction by transaction_id');
        transaction = txIdTx;
        
        // Update external_transaction_id for future lookups
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ external_transaction_id: txnId })
          .eq('id', txIdTx.id);
          
        if (updateError) {
          console.error('Error updating external_transaction_id:', updateError);
        }
      }
    }

    if (!transaction) {
      console.error(`Transaction not found for txn_id: ${txnId}`);
      return { 
        success: false, 
        message: 'Transaction not found',
        txnId,
        logEntryId 
      };
    }

    // Map status and update transaction
    let newStatus;
    if (status === 100 || status === 1) {
      newStatus = 'completed';
    } else if (status < 0) {
      newStatus = 'failed';
    } else {
      newStatus = 'pending';
    }
    
    // Update transaction with new status
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.id);
      
    if (updateError) {
      console.error('Error updating transaction:', updateError);
      return {
        success: false,
        message: `Failed to update transaction: ${updateError.message}`,
        transaction,
        logEntryId
      };
    }

    // Create notification for completed or failed status
    if (newStatus === 'completed') {
      try {
        await createPaymentConfirmationNotification(
          supabase, 
          transaction.user_id, 
          transaction.amount
        );
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
    } else if (newStatus === 'failed') {
      try {
        await createPaymentFailedNotification(
          supabase, 
          transaction.user_id, 
          transaction.amount,
          'Payment was rejected or cancelled'
        );
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }

    return {
      success: true,
      message: `Transaction status updated to ${newStatus}`,
      transaction,
      newStatus,
      logEntryId
    };
    
  } catch (error) {
    console.error('Unhandled exception in processIpnPayload:', error);
    return {
      success: false,
      message: `Internal error: ${error.message}`,
      error: error.stack,
      logEntryId
    };
  }
}

export async function processTransactionStatus(supabase: any, transaction: any, statusData: any, storeExternalIds: boolean = true) {
  try {
    console.log(`Processing transaction status for transaction ID: ${transaction.id}`);
    console.log(`Status data: ${JSON.stringify(statusData)}`);
    
    const result = statusData.result || {};
    const previousStatus = transaction.status;
    
    // Map CoinPayments status to our internal status
    let newStatus;
    if (result.status === 100 || result.status === 1) {
      newStatus = 'completed';
    } else if (result.status < 0) {
      newStatus = 'failed';
    } else {
      newStatus = 'pending';
    }
    
    // Only update if status has changed
    let updated = false;
    
    if (newStatus !== previousStatus) {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);
        
      if (updateError) {
        console.error('Error updating transaction:', updateError);
        return {
          success: false,
          message: `Failed to update transaction: ${updateError.message}`,
          transaction,
          updated: false
        };
      }
      
      updated = true;
      
      // Create appropriate notifications
      if (newStatus === 'completed') {
        try {
          await createPaymentConfirmationNotification(
            supabase, 
            transaction.user_id, 
            transaction.amount
          );
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
        }
      } else if (newStatus === 'failed') {
        try {
          await createPaymentFailedNotification(
            supabase, 
            transaction.user_id, 
            transaction.amount,
            getStatusDescription(result.status)
          );
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
        }
      }
    }
    
    // Ensure external_transaction_id is set if needed
    if (storeExternalIds && result.txn_id && result.txn_id !== transaction.external_transaction_id) {
      console.log(`Updating external_transaction_id from ${transaction.external_transaction_id} to ${result.txn_id}`);
      
      const { error: updateIdError } = await supabase
        .from('transactions')
        .update({
          external_transaction_id: result.txn_id
        })
        .eq('id', transaction.id);
        
      if (updateIdError) {
        console.error('Error updating external_transaction_id:', updateIdError);
      } else {
        updated = true;
      }
    }
    
    return {
      success: true,
      message: updated ? `Transaction status updated to ${newStatus}` : 'No changes needed',
      transaction: {
        ...transaction,
        status: newStatus
      },
      updated,
      newStatus,
      previousStatus
    };
    
  } catch (error) {
    console.error('Unhandled exception in processTransactionStatus:', error);
    return {
      success: false,
      message: `Internal error: ${error.message}`,
      error: error.stack,
      transaction
    };
  }
}
