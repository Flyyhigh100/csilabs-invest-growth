
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";
import { checkCoinPaymentsTransaction } from "../_shared/coinpayments-api.ts";
import { processTransactionStatus } from "../_shared/transaction-handler.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const client = createSupabaseClient();
    const { transactionId, forceUpdate = false } = await req.json();
    
    if (!transactionId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Transaction ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Checking status for transaction: ${transactionId}`);
    
    // Get transaction from database
    const { data: transaction, error: txError } = await client
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (txError || !transaction) {
      console.error('Error fetching transaction:', txError?.message || 'Transaction not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: txError ? `Database error: ${txError.message}` : 'Transaction not found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if transaction has external ID
    if (!transaction.external_transaction_id) {
      console.error(`Transaction ${transactionId} has no external_transaction_id`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Transaction has no external transaction ID to check'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Skip completed transactions unless force update is requested
    if (!forceUpdate && (transaction.status === 'completed' || transaction.status === 'confirmed')) {
      console.log(`Transaction ${transactionId} already in final state: ${transaction.status}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Transaction already in final state: ${transaction.status}`,
          status: transaction.status,
          transaction: transaction
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Check transaction status with CoinPayments
    const apiResponse = await checkCoinPaymentsTransaction(transaction.external_transaction_id);
    
    if (apiResponse.error) {
      console.error(`API error for transaction ${transactionId}:`, apiResponse.status_text);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `API error: ${apiResponse.status_text}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Process status update
    const updateResult = await processTransactionStatus(client, transaction, apiResponse);
    
    // Return results
    if (updateResult.success) {
      if (updateResult.updated) {
        console.log(`Successfully updated transaction ${transactionId} status from ${updateResult.previousStatus} to ${updateResult.newStatus}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: updateResult.message,
            previousStatus: updateResult.previousStatus,
            newStatus: updateResult.newStatus
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } else {
        console.log(`No status change for transaction ${transactionId}, still at ${transaction.status}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'No status change required',
            status: transaction.status,
            transaction: transaction
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    } else {
      console.error(`Failed to update transaction ${transactionId}:`, updateResult.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: updateResult.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled exception in check-coinpayments-status:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: `Internal server error: ${error.message}`,
        details: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
