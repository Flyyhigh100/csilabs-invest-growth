
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";
import { checkCoinPaymentsTransaction } from "./coinpayments-api.ts";
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
    
    // Ensure external_transaction_id exists before calling API
    if (!transaction.external_transaction_id) {
      console.error(`Transaction ${transactionId} is missing external_transaction_id required for CoinPayments API call.`);
      return createErrorResponse(`Transaction ${transactionId} is missing the external CoinPayments transaction ID. Cannot check status.`, 400);
    }
    
    // Fetch status from CoinPayments API using the correct function and ID
    const apiResponse = await checkCoinPaymentsTransaction(transaction.external_transaction_id);
    
    // Check for errors from the API call itself
    if (apiResponse.error) {
      console.error('Error calling CoinPayments API:', apiResponse.status_text);
      return createErrorResponse(`API error: ${apiResponse.status_text || 'Unknown API error'}`, 500);
    }
    
    // If no result data was returned, something went wrong (should have been caught by apiResponse.error, but double check)
    if (!apiResponse.result) {
      console.error('No result data returned from CoinPayments API function despite no error flag');
      return createErrorResponse('No status data returned from CoinPayments API call', 500);
    }
    
    // Use apiResponse.result which contains the payload for processing
    const statusData = { result: apiResponse.result }; // Structure expected by processTransactionStatus
    
    // NOTE: Storing external transaction ID is now primarily handled by the webhook/initial creation.
    // The ensureExternalTransactionIdStored check within processTransactionStatus will handle cases where it might be missing.
    // The explicit update block here is removed as checkCoinPaymentsTransaction requires the ID beforehand.

    // Process the transaction status using the result from the API call
    const result = await processTransactionStatus(supabase, transaction, statusData, storeExternalIds);
    
    return createSuccessResponse({
      message: `Transaction status checked: ${result.message}`,
      transaction: result.transaction,
      statusData: statusData, // Return the wrapped data
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
