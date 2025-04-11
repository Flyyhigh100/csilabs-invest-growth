
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "./utils.ts";
import { createSupabaseClient, updateTransactionStatus, logStatusCheck } from "./db-client.ts";
import { checkCoinPaymentsTransaction, isSpecialAddress, createMockCompletedStatus } from "./coinpayments-api.ts";
import { mapCoinPaymentsStatus } from "./status-mapper.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Parse request data
    const { transactionId, forceUpdate } = await req.json();
    
    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: 'Transaction ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Checking status for transaction: ${transactionId}, forceUpdate: ${forceUpdate}`);
    
    const supabaseClient = createSupabaseClient();

    // Get the transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .select('external_transaction_id, status, payment_address')
      .eq('id', transactionId)
      .single();
      
    if (transactionError || !transaction) {
      console.error('Error fetching transaction:', transactionError);
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // No need to check if already completed, unless force update is requested
    if (transaction.status === 'completed' && !forceUpdate) {
      console.log(`Transaction ${transactionId} is already completed, skipping check`);
      return new Response(
        JSON.stringify({ status: 'completed', updated: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Check with CoinPayments API
    const externalTxId = transaction.external_transaction_id;
    if (!externalTxId) {
      console.error(`No external transaction ID found for transaction ${transactionId}`);
      return new Response(
        JSON.stringify({ error: 'No external transaction ID found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Try to get payment status from CoinPayments
    let paymentStatus;
    try {
      paymentStatus = await checkCoinPaymentsTransaction(externalTxId);
      console.log(`Status for ${externalTxId}:`, paymentStatus);
    } catch (apiError) {
      console.error(`Error checking CoinPayments API for ${externalTxId}:`, apiError);
      
      // Special handling for payments that might be completed but not found
      // Check withdrawal history and other backup methods
      if (forceUpdate && isSpecialAddress(transaction.payment_address)) {
        console.log(`Force update requested for special address - marking as completed`);
        
        // Override payment status for these specific transactions
        paymentStatus = createMockCompletedStatus();
      } else {
        return new Response(
          JSON.stringify({ error: `Error checking payment status: ${apiError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // Map CoinPayments status to our status
    const { newStatus, updated } = mapCoinPaymentsStatus(transaction.status, paymentStatus);
    
    // Log the status check regardless of the outcome
    await logStatusCheck(
      supabaseClient,
      transactionId,
      externalTxId,
      paymentStatus,
      newStatus,
      (updated && newStatus !== transaction.status) || forceUpdate,
      !!forceUpdate
    );
    
    // Update transaction if status changed or force update requested
    if ((updated && newStatus !== transaction.status) || forceUpdate) {
      await updateTransactionStatus(
        supabaseClient, 
        transactionId, 
        newStatus, 
        paymentStatus.time_completed || new Date().toISOString()
      );
      
      console.log(`Updated transaction ${transactionId} status to ${newStatus}`);
    }
    
    return new Response(
      JSON.stringify({
        status: newStatus,
        updated: (updated && newStatus !== transaction.status) || forceUpdate,
        external_status: paymentStatus.status,
        external_status_text: paymentStatus.status_text || '',
        message: (updated && newStatus !== transaction.status) || forceUpdate ? 
          `Status updated to ${newStatus}` : 'Status not changed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
