
import { createSupabaseClient, updateTransactionStatus, logStatusCheck } from "./db-client.ts";
import { mapCoinPaymentsStatus } from "./status-mapper.ts";
import { checkCoinPaymentsTransaction, isSpecialAddress, createMockCompletedStatus } from "./coinpayments-api.ts";
import { createErrorResponse, createSuccessResponse } from "./utils.ts";

export async function processTransaction(transactionId: string, forceUpdate = false) {
  console.log(`Processing transaction: ${transactionId}, forceUpdate: ${forceUpdate}`);
  
  try {
    const supabaseClient = createSupabaseClient();
    
    // Implement a more flexible transaction lookup strategy
    console.log(`Fetching transaction from database using multiple strategies for ID: ${transactionId}`);
    
    // First try with the direct ID
    let { data: transaction, error } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .maybeSingle();
      
    if (!transaction && !error) {
      // Try transaction_id field as fallback
      console.log(`Transaction not found by primary ID, trying transaction_id field: ${transactionId}`);
      const { data: txIdLookup, error: txIdError } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .maybeSingle();
        
      if (txIdLookup) {
        console.log(`Found transaction using transaction_id field`);
        transaction = txIdLookup;
        error = null;
      } else if (!txIdError) {
        // Try external_transaction_id as another fallback
        console.log(`Transaction not found by transaction_id, trying external_transaction_id: ${transactionId}`);
        const { data: externalTxLookup, error: externalTxError } = await supabaseClient
          .from('transactions')
          .select('*')
          .eq('external_transaction_id', transactionId)
          .maybeSingle();
          
        if (externalTxLookup) {
          console.log(`Found transaction using external_transaction_id field`);
          transaction = externalTxLookup;
          error = null;
        } else if (externalTxError) {
          error = externalTxError;
        }
      } else {
        error = txIdError;
      }
    }
    
    if (error) {
      console.error(`Database error fetching transaction ${transactionId}:`, error);
      return createErrorResponse(`Database error: ${error.message}`, 500);
    }
    
    if (!transaction) {
      console.error(`Transaction not found in database with any ID: ${transactionId}`);
      
      // Provide more detailed diagnostic information for debugging
      console.log(`Running diagnostic query to find similar transactions...`);
      try {
        const { data: diagnosticData } = await supabaseClient
          .from('transactions')
          .select('id, transaction_id, external_transaction_id, payment_method, status')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (diagnosticData && diagnosticData.length > 0) {
          console.log(`Found ${diagnosticData.length} recent transactions. Listing for diagnostic purposes:`);
          diagnosticData.forEach(tx => {
            console.log(`- ID: ${tx.id}, transaction_id: ${tx.transaction_id}, external_id: ${tx.external_transaction_id}, method: ${tx.payment_method}, status: ${tx.status}`);
          });
        } else {
          console.log(`No recent transactions found in database for diagnostic purposes.`);
        }
      } catch (diagError) {
        console.error(`Error running diagnostic query:`, diagError);
      }
      
      return createErrorResponse(`Transaction not found in database. ID tried: ${transactionId}`, 404);
    }
    
    // Log transaction data for debugging
    console.log(`Transaction found:`, {
      id: transaction.id,
      payment_method: transaction.payment_method,
      status: transaction.status,
      external_id: transaction.external_transaction_id || 'none',
      transaction_id: transaction.transaction_id || 'none',
      payment_address: transaction.payment_address || 'none'
    });
    
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
    
    // Get external transaction ID, with fallback to transaction_id if needed
    const externalTxId = transaction.external_transaction_id || transaction.transaction_id;
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
          console.error(`API error checking payment status: ${paymentStatus.status_text || 'No error text'}`);
          // Identify if this is an API key permission issue
          if (paymentStatus.status_text?.toLowerCase().includes('hmac signature') || 
              paymentStatus.status_text?.toLowerCase().includes('invalid key') || 
              paymentStatus.status_text?.toLowerCase().includes('permissions')) {
            
            console.error('This appears to be an API key permission issue. Check CoinPayments API key settings.');
            return createErrorResponse(
              `CoinPayments API key permission issue: ${paymentStatus.status_text}`,
              401,
              { api_key_issue: true, details: `Error from CoinPayments API: ${JSON.stringify(paymentStatus)}` }
            );
          }
          
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
    const newStatus = mapCoinPaymentsStatus(paymentStatus.status);
    const updated = newStatus !== transaction.status;
    
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
