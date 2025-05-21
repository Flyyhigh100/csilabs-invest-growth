
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";
import { checkCoinPaymentsTransaction } from "../_shared/coinpayments-api.ts";
import { processTransactionStatus } from "../_shared/transaction-handler.ts";

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const client = createSupabaseClient();
    const { transactionIds, forceUpdate = false, storeExternalIds = true, statusFilter } = await req.json();
    
    console.log(`Processing sync for ${transactionIds ? transactionIds.length : 'all'} transactions`);
    console.log(`Force update: ${forceUpdate}, Store external IDs: ${storeExternalIds}`);
    
    // Fetch transactions to update - either specific IDs or all pending ones
    let query = client.from('transactions')
      .select('*')
      .eq('payment_method', 'coinpayments');
    
    if (transactionIds && Array.isArray(transactionIds) && transactionIds.length > 0) {
      // Specific transaction IDs provided
      console.log(`Filtering by ${transactionIds.length} specific transaction IDs`);
      query = query.in('id', transactionIds);
    } else if (statusFilter) {
      // Filter by status
      console.log(`Filtering by status: ${statusFilter}`);
      query = query.eq('status', statusFilter);
    } else {
      // Default to pending transactions
      console.log('Filtering by default status: pending');
      query = query.eq('status', 'pending');
    }
    
    console.log('Executing transaction query');
    const { data: transactions, error: txError } = await query;
    
    if (txError) {
      console.error('Error fetching transactions:', txError);
      return new Response(JSON.stringify({
        success: false,
        message: `Failed to fetch transactions: ${txError.message}`,
        totalProcessed: 0,
        successCount: 0,
        failureCount: 0
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    if (!transactions || transactions.length === 0) {
      console.log('No transactions found to process');
      return new Response(JSON.stringify({
        success: true,
        message: 'No transactions found to process',
        totalProcessed: 0,
        successCount: 0,
        failureCount: 0
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }
    
    console.log(`Found ${transactions.length} transactions to process`);
    
    // Track success and failures
    const results = {
      totalProcessed: transactions.length,
      successCount: 0,
      failureCount: 0,
      updatedTransactions: [] as any[],
      failedTransactions: [] as any[]
    };
    
    // Process each transaction
    for (const transaction of transactions) {
      try {
        console.log(`Processing transaction ${transaction.id} (${transaction.transaction_id})`);
        
        // Skip transactions without external_transaction_id
        if (!transaction.external_transaction_id) {
          console.warn(`Transaction ${transaction.id} has no external_transaction_id, skipping`);
          results.failureCount++;
          results.failedTransactions.push({
            id: transaction.id,
            transaction_id: transaction.transaction_id,
            error: 'Missing external transaction ID'
          });
          continue;
        }
        
        // Check transaction status with CoinPayments
        const txnId = transaction.external_transaction_id;
        console.log(`Checking status for external transaction: ${txnId}`);
        
        const apiResponse = await checkCoinPaymentsTransaction(txnId);
        
        if (apiResponse.error) {
          console.error(`API error for transaction ${transaction.id}:`, apiResponse.status_text);
          results.failureCount++;
          results.failedTransactions.push({
            id: transaction.id,
            transaction_id: transaction.transaction_id,
            external_id: txnId,
            error: apiResponse.status_text
          });
          continue;
        }
        
        // If no result data was returned, something went wrong
        if (!apiResponse.result) {
          console.error(`No result data returned for transaction ${transaction.id}`);
          results.failureCount++;
          results.failedTransactions.push({
            id: transaction.id,
            transaction_id: transaction.transaction_id,
            external_id: txnId,
            error: 'No result data returned from API call'
          });
          continue;
        }
        
        // Process the transaction status
        const statusData = { result: apiResponse.result };
        const updateResult = await processTransactionStatus(
          client, 
          transaction, 
          statusData, 
          storeExternalIds
        );
        
        if (!updateResult.success) {
          console.error(`Failed to update transaction ${transaction.id}:`, updateResult.message);
          results.failureCount++;
          results.failedTransactions.push({
            id: transaction.id,
            transaction_id: transaction.transaction_id,
            external_id: txnId,
            error: updateResult.message
          });
          continue;
        }
        
        if (updateResult.updated) {
          console.log(`Successfully updated transaction ${transaction.id} status from ${updateResult.previousStatus} to ${updateResult.newStatus}`);
          results.successCount++;
          results.updatedTransactions.push({
            id: transaction.id,
            transaction_id: transaction.transaction_id,
            from: updateResult.previousStatus,
            to: updateResult.newStatus
          });
        } else {
          console.log(`No status change for transaction ${transaction.id}, still at ${transaction.status}`);
        }
        
      } catch (err) {
        console.error(`Error processing transaction ${transaction.id}:`, err);
        results.failureCount++;
        results.failedTransactions.push({
          id: transaction.id,
          transaction_id: transaction.transaction_id,
          error: err.message || 'Unknown error'
        });
      }
    }
    
    console.log(`Finished processing ${results.totalProcessed} transactions`);
    console.log(`Success: ${results.successCount}, Failures: ${results.failureCount}`);
    
    // Return summary results
    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${results.totalProcessed} transactions, ${results.successCount} updated successfully`,
      ...results
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error('Unhandled exception in admin-sync-all-transactions:', error);
    return new Response(JSON.stringify({
      success: false,
      message: `Internal server error: ${error.message}`,
      details: error.stack
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
