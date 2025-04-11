
import { createDbClient } from "./db-client.ts";
import { mapCoinPaymentsStatus, getStatusDescription } from "./status-mapper.ts";
import { createPaymentConfirmationNotification } from "./notification.ts";

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
    
    const supabase = createDbClient();
    
    // Enhanced transaction lookup strategy
    console.log(`Looking up transaction with external_transaction_id: ${ipnData.txn_id}`);
    
    // First try looking up by external_transaction_id
    let { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('external_transaction_id', ipnData.txn_id)
      .maybeSingle();
    
    // If not found, try looking up by transaction_id
    if (!transaction && !error) {
      console.log(`Transaction not found by external_transaction_id, trying transaction_id: ${ipnData.txn_id}`);
      const { data: altTransaction, error: altError } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_id', ipnData.txn_id)
        .maybeSingle();
      
      if (altTransaction) {
        console.log("Transaction found using transaction_id field");
        transaction = altTransaction;
      } else if (altError) {
        console.error("Error looking up transaction by transaction_id:", altError);
        error = altError;
      }
    }
    
    // If not found and we have payment address, try that as a last resort
    if (!transaction && !error && ipnData.address) {
      console.log(`Transaction not found by IDs, trying payment_address: ${ipnData.address}`);
      const { data: addressTransaction, error: addressError } = await supabase
        .from('transactions')
        .select('*')
        .eq('payment_address', ipnData.address)
        .maybeSingle();
      
      if (addressTransaction) {
        console.log("Transaction found using payment_address field");
        transaction = addressTransaction;
      } else if (addressError) {
        console.error("Error looking up transaction by payment_address:", addressError);
        error = addressError;
      }
    }
    
    if (error) {
      console.error(`Error finding transaction for txn_id ${ipnData.txn_id}:`, error);
      return { 
        success: false, 
        message: `Database error: ${error.message}`,
        logEntryId
      };
    }
    
    if (!transaction) {
      console.error(`Transaction not found for txn_id: ${ipnData.txn_id}`);
      
      // Run a diagnostic query to help identify the issue
      try {
        console.log("Running diagnostics to look for similar transactions...");
        const { data: recentTransactions } = await supabase
          .from('transactions')
          .select('id, external_transaction_id, transaction_id, payment_method, payment_address')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (recentTransactions && recentTransactions.length > 0) {
          console.log("Recent transactions for comparison:");
          recentTransactions.forEach(tx => {
            console.log(`- ID: ${tx.id}, external_id: ${tx.external_transaction_id}, tx_id: ${tx.transaction_id}, method: ${tx.payment_method}, address: ${tx.payment_address}`);
          });
        } else {
          console.log("No recent transactions found for diagnostics");
        }
      } catch (diagError) {
        console.error("Error running diagnostics:", diagError);
      }
      
      return { 
        success: false, 
        message: `Transaction not found for txn_id: ${ipnData.txn_id}`,
        logEntryId
      };
    }
    
    console.log(`Found transaction ${transaction.id}, current status: ${transaction.status}`);
    
    // Parse status and map to our internal status format
    const statusCode = parseInt(ipnData.status, 10);
    const newStatus = mapCoinPaymentsStatus(statusCode);
    const statusDescription = getStatusDescription(statusCode);
    
    console.log(`CoinPayments status: ${statusCode} (${statusDescription}), mapped to: ${newStatus}`);
    
    // If status is already completed and tokens sent, ignore this notification
    if (transaction.status === 'completed' && transaction.token_sent) {
      console.log(`Transaction ${transaction.id} already completed and tokens sent, ignoring update`);
      return { 
        success: true, 
        message: "Transaction already completed",
        transaction,
        statusUpdated: false,
        logEntryId
      };
    }
    
    // Only update if status is different
    if (transaction.status === newStatus) {
      console.log(`Transaction ${transaction.id} already has status ${newStatus}, no update needed`);
      return { 
        success: true, 
        message: `Transaction status already set to ${newStatus}`,
        transaction,
        statusUpdated: false,
        logEntryId
      };
    }
    
    console.log(`Updating transaction ${transaction.id} status from ${transaction.status} to ${newStatus}`);
    
    // Prepare update object
    const updateObject: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    // If the status is completed, also set the completed_at field
    if (newStatus === 'completed') {
      updateObject.completed_at = new Date().toISOString();
    }
    
    // Update transaction in the database
    const { error: updateError } = await supabase
      .from('transactions')
      .update(updateObject)
      .eq('id', transaction.id);
    
    if (updateError) {
      console.error(`Error updating transaction ${transaction.id}:`, updateError);
      return { 
        success: false, 
        message: `Failed to update transaction: ${updateError.message}`,
        transaction,
        logEntryId
      };
    }
    
    console.log(`Successfully updated transaction ${transaction.id} to status: ${newStatus}`);
    
    // Create notification for user if status changed to completed or failed
    if (newStatus === 'completed' || newStatus === 'failed') {
      try {
        const notificationResult = await createPaymentConfirmationNotification(
          transaction.user_id,
          transaction.id,
          newStatus,
          transaction.amount
        );
        
        console.log(`Notification creation result:`, notificationResult);
      } catch (notifError) {
        console.error(`Error creating notification:`, notifError);
        // Continue despite notification error
      }
    }
    
    // Return success
    return { 
      success: true, 
      message: `Transaction updated to ${newStatus}`,
      transaction,
      statusUpdated: true,
      newStatus,
      previousStatus: transaction.status,
      logEntryId
    };
    
  } catch (error) {
    console.error("Error processing IPN payload:", error);
    return { 
      success: false, 
      message: `Exception: ${error.message}`,
      error: error.stack,
      logEntryId
    };
  }
}
