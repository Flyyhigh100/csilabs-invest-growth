
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

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

async function fetchPendingTransactions(supabase: any) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('payment_method', 'coinpayments')
      .in('status', ['pending', 'confirmed']);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    throw error;
  }
}

async function checkTransactionStatus(transaction: any, forceUpdate: boolean = false, storeExternalIds: boolean = true) {
  try {
    const url = new URL(Deno.env.get('SUPABASE_URL') + '/functions/v1/check-coinpayments-status');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        transactionId: transaction.id,
        forceUpdate,
        storeExternalIds
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Status check failed: ${JSON.stringify(result)}`);
    }
    
    return {
      transaction,
      status: response.status,
      result
    };
  } catch (error) {
    console.error(`Error checking transaction ${transaction.id}:`, error);
    return {
      transaction,
      status: 500,
      result: { error: error.message }
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const { forceUpdate = false, storeExternalIds = true } = await req.json();
    
    // Get Supabase client
    const supabase = createSupabaseClient();
    
    // Get current user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
    
    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Admin access required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Fetch pending transactions
    const pendingTransactions = await fetchPendingTransactions(supabase);
    
    // No pending transactions to process
    if (!pendingTransactions || pendingTransactions.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No pending transactions found',
          totalProcessed: 0,
          successCount: 0,
          failureCount: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing ${pendingTransactions.length} pending transactions`);
    
    // Process each transaction in parallel
    const results = await Promise.all(
      pendingTransactions.map(tx => checkTransactionStatus(tx, forceUpdate, storeExternalIds))
    );
    
    // Count successes and failures
    const successResults = results.filter(res => res.status === 200);
    const failureResults = results.filter(res => res.status !== 200);
    
    // Generate detailed report
    const report = {
      message: `Processed ${pendingTransactions.length} transactions: ${successResults.length} succeeded, ${failureResults.length} failed`,
      totalProcessed: pendingTransactions.length,
      successCount: successResults.length,
      failureCount: failureResults.length,
      successDetails: successResults.map(res => ({
        transactionId: res.transaction.id,
        externalId: res.transaction.external_transaction_id,
        result: res.result
      })),
      failureDetails: failureResults.map(res => ({
        transactionId: res.transaction.id,
        error: res.result.error || 'Unknown error'
      }))
    };
    
    return new Response(
      JSON.stringify(report),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in admin-sync-all-transactions:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
