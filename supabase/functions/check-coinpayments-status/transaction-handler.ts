
import { createSupabaseClient, updateTransactionStatus, logStatusCheck } from "./db-client.ts";
import { mapCoinPaymentsStatus } from "./status-mapper.ts";
import { checkCoinPaymentsTransaction } from "./coinpayments-api.ts";

export async function processTransaction(transactionId: string, forceUpdate = false) {
  console.log(`Processing transaction: ${transactionId}, forceUpdate: ${forceUpdate}`);
  
  try {
    const supabaseClient = createSupabaseClient();
    
    // Fetch transaction from database
    const { data: transaction, error } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching transaction:", error);
      return { error: error.message };
    }
    
    if (!transaction) {
      console.error("Transaction not found");
      return { error: 'Transaction not found' };
    }
    
    // Ensure it's a CoinPayments transaction
    if (transaction.payment_method !== 'coinpayments') {
      return { 
        error: 'Not a CoinPayments transaction', 
        transaction: transaction
      };
    }
    
    // Skip check if transaction is already completed and tokens were sent, unless forcing
    if (transaction.status === 'completed' && transaction.token_sent && !forceUpdate) {
      return { 
        message: 'Transaction already completed and tokens sent', 
        transaction: transaction,
        payment_status: { status: 100, status_text: 'Complete' }
      };
    }
    
    // Get external transaction ID
    const externalTxId = transaction.external_transaction_id;
    if (!externalTxId) {
      return { 
        error: 'Missing external transaction ID', 
        transaction: transaction
      };
    }
    
    // Query CoinPayments API for transaction status
    const paymentStatus = await checkCoinPaymentsTransaction(externalTxId);
    
    if (!paymentStatus) {
      return { 
        error: 'Failed to retrieve payment status', 
        transaction: transaction
      };
    }
    
    // Map CoinPayments status to our internal status
    const { newStatus, updated } = mapCoinPaymentsStatus(transaction.status, paymentStatus);
    
    // Force update if requested regardless of current status
    const shouldUpdate = updated || forceUpdate;
    
    // Update transaction status if needed
    if (shouldUpdate) {
      console.log(`Updating transaction status from ${transaction.status} to ${newStatus}`);
      
      const completedAt = (newStatus === 'completed' || paymentStatus.status === 1 || paymentStatus.status >= 100) 
        ? new Date().toISOString() 
        : undefined;
      
      await updateTransactionStatus(
        supabaseClient,
        transaction.id,
        newStatus,
        completedAt
      );
      
      // Log the status check
      await logStatusCheck(
        supabaseClient,
        transaction.id,
        externalTxId,
        paymentStatus,
        newStatus,
        true,
        forceUpdate
      );
      
      // Fetch the updated transaction
      const { data: updatedTransaction } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();
        
      return { 
        message: `Transaction status updated to ${newStatus}`,
        transaction: updatedTransaction,
        payment_status: paymentStatus,
        updated: true,
        external_status: paymentStatus.status,
        external_status_text: paymentStatus.status_text
      };
    } else {
      // Log the status check even if no update was needed
      await logStatusCheck(
        supabaseClient,
        transaction.id,
        externalTxId,
        paymentStatus,
        newStatus,
        false,
        forceUpdate
      );
      
      return { 
        message: `No update needed. Current status: ${transaction.status}`,
        transaction: transaction,
        payment_status: paymentStatus,
        updated: false,
        external_status: paymentStatus.status,
        external_status_text: paymentStatus.status_text
      };
    }
  } catch (error) {
    console.error("Error processing transaction:", error);
    return { error: error.message };
  }
}
