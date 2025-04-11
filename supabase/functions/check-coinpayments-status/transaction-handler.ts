
import { createSupabaseClient, updateTransactionStatus, logStatusCheck } from "./db-client.ts";
import { mapCoinPaymentsStatus } from "./status-mapper.ts";
import { checkCoinPaymentsTransaction, isSpecialAddress, createMockCompletedStatus } from "./coinpayments-api.ts";
import { createErrorResponse, createSuccessResponse } from "./utils.ts";

export async function processTransaction(transactionId: string, forceUpdate = false) {
  console.log(`Processing transaction: ${transactionId}, forceUpdate: ${forceUpdate}`);
  
  try {
    const supabaseClient = createSupabaseClient();
    
    // Try to fetch the transaction with more flexible query options
    console.log(`Fetching transaction from database with ID: ${transactionId}`);
    
    // First try with the direct ID
    let { data: transaction, error } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .maybeSingle();
      
    if (!transaction && !error) {
      // If transaction is not found by id, try transaction_id field as fallback
      console.log(`Transaction not found by primary ID, trying transaction_id field: ${transactionId}`);
      const { data: fallbackTransaction, error: fallbackError } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .maybeSingle();
        
      if (fallbackTransaction) {
        console.log(`Found transaction using transaction_id field instead of primary key`);
        transaction = fallbackTransaction;
        error = null;
      } else if (fallbackError) {
        error = fallbackError;
      }
    }
    
    if (error) {
      console.error(`Database error fetching transaction ${transactionId}:`, error);
      return createErrorResponse(`Database error: ${error.message}`, 500);
    }
    
    if (!transaction) {
      console.error(`Transaction not found in database with ID: ${transactionId}`);
      
      // Provide more detailed diagnostic information
      const { data: diagnosticData } = await supabaseClient
        .from('transactions')
        .select('id, transaction_id, external_transaction_id')
        .limit(5);
      
      if (diagnosticData && diagnosticData.length > 0) {
        console.log(`For diagnostic purposes, here are some existing transaction IDs:`);
        diagnosticData.forEach(tx => {
          console.log(`- ID: ${tx.id}, transaction_id: ${tx.transaction_id}, external_id: ${tx.external_transaction_id}`);
        });
      }
      
      return createErrorResponse(`Transaction not found in database. ID tried: ${transactionId}`, 404);
    }
    
    // Log the transaction data to help with debugging
    console.log(`Transaction data found: ${JSON.stringify({
      id: transaction.id,
      payment_method: transaction.payment_method,
      status: transaction.status,
      external_id: transaction.external_transaction_id || 'none',
      transaction_id: transaction.transaction_id || 'none',
      payment_address: transaction.payment_address || 'none',
      created_at: transaction.created_at
    })}`);
    
    // Ensure it's a CoinPayments transaction
    if (transaction.payment_method !== 'coinpayments') {
      return createSuccessResponse({ 
        message: 'Not a CoinPayments transaction',
        transaction: transaction
      });
    }
    
    // Skip check if transaction is already completed and tokens were sent, unless forcing
    if (transaction.status === 'completed' && transaction.token_sent && !forceUpdate) {
      return createSuccessResponse({ 
        message: 'Transaction already completed and tokens sent', 
        transaction: transaction,
        payment_status: { status: 100, status_text: 'Complete' }
      });
    }
    
    // Get external transaction ID
    const externalTxId = transaction.external_transaction_id;
    if (!externalTxId) {
      console.error(`Missing external transaction ID for transaction ${transactionId}`);
      return createErrorResponse(`Missing external transaction ID for transaction ${transactionId}`, 400);
    }
    
    console.log(`Using external transaction ID: ${externalTxId} for CoinPayments API request`);
    
    // Special handling for known testing addresses or stuck transactions
    let paymentStatus;
    if (forceUpdate && isSpecialAddress(transaction.payment_address)) {
      console.log(`Using special handling for test address: ${transaction.payment_address}`);
      paymentStatus = createMockCompletedStatus();
    } else {
      // Query CoinPayments API for transaction status
      console.log(`Querying CoinPayments API for external tx: ${externalTxId}`);
      try {
        paymentStatus = await checkCoinPaymentsTransaction(externalTxId);
        
        if (!paymentStatus) {
          console.error(`Failed to retrieve payment status for external ID ${externalTxId}`);
          return createErrorResponse(
            `Failed to retrieve payment status from CoinPayments API for transaction ${transactionId} (external ID: ${externalTxId})`, 
            502
          );
        }
        
        // Check if the API returned an error
        if (paymentStatus.error) {
          console.error(`API error checking payment status for ${externalTxId}: ${paymentStatus.status_text || 'No error text'}`);
          // Identify if this is an API key permission issue
          if (paymentStatus.status_text?.toLowerCase().includes('hmac signature') || 
              paymentStatus.status_text?.toLowerCase().includes('invalid key') || 
              paymentStatus.status_text?.toLowerCase().includes('permissions')) {
            
            console.error('This appears to be an API key permission issue. Please check your CoinPayments API key settings.');
            return createErrorResponse(
              `CoinPayments API key permission issue: ${paymentStatus.status_text}`,
              401,
              { api_key_issue: true, details: `Error from CoinPayments API: ${JSON.stringify(paymentStatus)}` }
            );
          }
          
          // Return the error with details
          return createErrorResponse(
            paymentStatus.status_text || 'API error checking payment status', 
            paymentStatus.status_text?.includes('Invalid API key') ? 401 : 502,
            { details: `Error from CoinPayments API: ${JSON.stringify(paymentStatus)}` }
          );
        }
      } catch (apiError) {
        console.error('Error calling CoinPayments API:', apiError);
        return createErrorResponse(
          `CoinPayments API error: ${apiError.message || 'Unknown API error'}`, 
          502,
          { details: apiError.stack || 'No stack trace available' }
        );
      }
    }
    
    console.log(`Payment status received for ${externalTxId}:`, JSON.stringify(paymentStatus));
    
    // Map CoinPayments status to our internal status
    const { newStatus, updated } = mapCoinPaymentsStatus(transaction.status, paymentStatus);
    console.log(`Status mapping: CoinPayments=${paymentStatus.status}, Internal=${transaction.status} -> ${newStatus}, Updated=${updated}`);
    
    // Force update if requested regardless of current status
    const shouldUpdate = updated || forceUpdate;
    
    // Update transaction status if needed
    if (shouldUpdate) {
      console.log(`Updating transaction status from ${transaction.status} to ${newStatus}`);
      
      const completedAt = (newStatus === 'completed' || paymentStatus.status === 1 || paymentStatus.status >= 100) 
        ? new Date().toISOString() 
        : undefined;
      
      try {
        await updateTransactionStatus(
          supabaseClient,
          transaction.id,
          newStatus,
          completedAt
        );
      } catch (updateError) {
        console.error("Failed to update transaction status:", updateError);
        return createErrorResponse(`Failed to update transaction: ${updateError.message}`, 500);
      }
      
      // Log the status check
      try {
        await logStatusCheck(
          supabaseClient,
          transaction.id,
          externalTxId,
          paymentStatus,
          newStatus,
          true,
          forceUpdate
        );
      } catch (logError) {
        console.error("Failed to log status check:", logError);
        // Don't fail the whole operation just because logging failed
      }
      
      // Fetch the updated transaction
      const { data: updatedTransaction, error: fetchError } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('id', transaction.id)
        .single();
        
      if (fetchError) {
        console.error("Error fetching updated transaction:", fetchError);
        // Even if we couldn't fetch the updated transaction, we did update it
        return createSuccessResponse({ 
          message: `Transaction status updated to ${newStatus}`,
          transaction: transaction, // Return original transaction since we couldn't fetch updated one
          payment_status: paymentStatus,
          updated: true,
          external_status: paymentStatus.status,
          external_status_text: paymentStatus.status_text,
          status: newStatus
        });
      }
        
      return createSuccessResponse({ 
        message: `Transaction status updated to ${newStatus}`,
        transaction: updatedTransaction,
        payment_status: paymentStatus,
        updated: true,
        external_status: paymentStatus.status,
        external_status_text: paymentStatus.status_text,
        status: newStatus
      });
    } else {
      // Log the status check even if no update was needed
      try {
        await logStatusCheck(
          supabaseClient,
          transaction.id,
          externalTxId,
          paymentStatus,
          transaction.status,
          false,
          forceUpdate
        );
      } catch (logError) {
        console.error("Failed to log status check:", logError);
        // Continue despite log error
      }
      
      return createSuccessResponse({ 
        message: `No update needed. Current status: ${transaction.status}`,
        transaction: transaction,
        payment_status: paymentStatus,
        updated: false,
        external_status: paymentStatus.status,
        external_status_text: paymentStatus.status_text,
        status: transaction.status
      });
    }
  } catch (error) {
    console.error("Error processing transaction:", error);
    return createErrorResponse(error.message || "Unknown error processing transaction", 500, 
      { details: error.stack || 'No stack trace available' }
    );
  }
}
