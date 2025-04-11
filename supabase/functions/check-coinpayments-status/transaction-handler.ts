
import { createSupabaseClient, updateTransactionStatus, logStatusCheck } from "./db-client.ts";
import { mapCoinPaymentsStatus } from "./status-mapper.ts";
import { checkCoinPaymentsTransaction, isSpecialAddress, createMockCompletedStatus } from "./coinpayments-api.ts";
import { createErrorResponse, createSuccessResponse } from "./utils.ts";

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
      return createErrorResponse(`Database error: ${error.message}`, 500);
    }
    
    if (!transaction) {
      console.error(`Transaction not found with ID: ${transactionId}`);
      return createErrorResponse(`Transaction not found with ID: ${transactionId}`, 404);
    }
    
    // Log the transaction data to help with debugging
    console.log(`Transaction data found: ${JSON.stringify({
      id: transaction.id,
      payment_method: transaction.payment_method,
      status: transaction.status,
      external_id: transaction.external_transaction_id || 'none',
      transaction_id: transaction.transaction_id || 'none',
      payment_address: transaction.payment_address || 'none'
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
      return createErrorResponse(`Missing external transaction ID for transaction ${transactionId}`, 400);
    }
    
    // Special handling for known testing addresses or stuck transactions
    let paymentStatus;
    if (forceUpdate && isSpecialAddress(transaction.payment_address)) {
      console.log(`Using special handling for address: ${transaction.payment_address}`);
      paymentStatus = createMockCompletedStatus();
    } else {
      // Query CoinPayments API for transaction status
      console.log(`Querying CoinPayments API for tx: ${externalTxId}`);
      try {
        paymentStatus = await checkCoinPaymentsTransaction(externalTxId);
        
        if (!paymentStatus) {
          console.error(`Failed to retrieve payment status for ${externalTxId}`);
          return createErrorResponse(`Failed to retrieve payment status from CoinPayments API for transaction ${transactionId}`, 502);
        }
        
        if (paymentStatus.error) {
          console.error(`API error checking payment status: ${paymentStatus.status_text}`);
          // Still return data for logging but mark as error
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
        .eq('id', transactionId)
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
