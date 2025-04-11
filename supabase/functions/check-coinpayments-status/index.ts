
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";
import { checkCoinPaymentsStatus } from "./coinpayments-api.ts";
import { processTransactionStatus } from "./transaction-handler.ts";
import { createErrorResponse, createSuccessResponse } from "./utils.ts";

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return createErrorResponse('Invalid JSON in request body');
    }
    
    console.log('Processing check-coinpayments-status request:', JSON.stringify(requestBody));
    
    // Extract params
    const { transactionId, forceUpdate = false, storeExternalIds = true } = requestBody;
    
    // Validate required fields
    if (!transactionId) {
      return createErrorResponse('Missing required field: transactionId');
    }
    
    // Setup Supabase client
    const supabase = createSupabaseClient();
    
    // Fetch the transaction details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .maybeSingle();
    
    if (txError || !transaction) {
      console.error('Error fetching transaction:', txError);
      return createErrorResponse(
        txError ? `Database error: ${txError.message}` : `Transaction not found: ${transactionId}`,
        404
      );
    }
    
    // Validate that it's a CoinPayments transaction
    if (transaction.payment_method !== 'coinpayments') {
      return createErrorResponse(`Transaction ${transactionId} is not a CoinPayments transaction`, 400);
    }
    
    // Fetch status from CoinPayments API based on the transaction info
    const { data: statusData, error: statusError } = await checkCoinPaymentsStatus(transaction, forceUpdate);
    
    if (statusError) {
      console.error('Error checking transaction status:', statusError);
      return createErrorResponse(`API error: ${statusError.message}`, 500);
    }
    
    // If no data was returned, something went wrong
    if (!statusData) {
      return createErrorResponse('No status data returned from CoinPayments', 500);
    }
    
    // Store external transaction ID if present in the response
    if (storeExternalIds && statusData.result && statusData.result.txn_id) {
      console.log(`External txn_id found: ${statusData.result.txn_id}, updating transaction ${transaction.id}`);
      
      if (!transaction.external_transaction_id) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ external_transaction_id: statusData.result.txn_id })
          .eq('id', transaction.id);
          
        if (updateError) {
          console.error('Error updating external_transaction_id:', updateError);
        } else {
          console.log(`Successfully updated external_transaction_id for transaction ${transaction.id}`);
          // Update the transaction object for further processing
          transaction.external_transaction_id = statusData.result.txn_id;
        }
      } else if (transaction.external_transaction_id !== statusData.result.txn_id) {
        console.warn(`Transaction ${transaction.id} has different external_transaction_id: 
          stored=${transaction.external_transaction_id}, 
          coinpayments=${statusData.result.txn_id}`);
      }
    }
    
    // Process the transaction status
    const result = await processTransactionStatus(supabase, transaction, statusData, storeExternalIds);
    
    return createSuccessResponse({
      message: `Transaction status checked: ${result.message}`,
      transaction: result.transaction,
      statusData: statusData,
      updated: result.updated,
      newStatus: result.newStatus,
      previousStatus: result.previousStatus
    });
    
  } catch (error) {
    console.error('Unhandled exception:', error);
    return createErrorResponse(
      `Internal server error: ${error.message}`,
      500,
      { stack: error.stack }
    );
  }
});
