
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Initialize Supabase client
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  return createClient(supabaseUrl, supabaseKey);
}

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate request
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createSupabaseClient();

    // Verify the user is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(authorization.replace('Bearer ', ''));
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if user is an admin
    const { data: isAdmin, error: adminCheckError } = await supabase
      .rpc('is_admin');
      
    if (adminCheckError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body for any options
    const { forceUpdate = false } = await req.json().catch(() => ({}));
    
    // Get all pending crypto transactions
    const { data: pendingTransactions, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('payment_method', 'coinpayments')
      .in('status', ['pending', 'confirmed'])
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch transactions', details: fetchError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${pendingTransactions.length} pending transactions to sync`);
    
    if (!pendingTransactions || pendingTransactions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending transactions found to sync', count: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process each transaction
    const results = [];
    let successCount = 0;
    let failureCount = 0;
    
    for (const transaction of pendingTransactions) {
      try {
        console.log(`Syncing transaction ${transaction.id}...`);
        
        // Call the check-coinpayments-status function for each transaction
        const response = await fetch(
          `${Deno.env.get('SUPABASE_FUNCTIONS_URL')}/check-coinpayments-status`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authorization
            },
            body: JSON.stringify({
              transactionId: transaction.id,
              forceUpdate
            })
          }
        );
        
        const result = await response.json();
        
        // Determine if the sync was successful
        const success = response.ok && result && !result.error;
        if (success) {
          successCount++;
        } else {
          failureCount++;
        }
        
        // Store the result for this transaction
        results.push({
          transactionId: transaction.id,
          success,
          statusCode: response.status,
          updated: result.updated || false,
          oldStatus: transaction.status,
          newStatus: result.status || transaction.status,
          error: result.error || null
        });
        
        console.log(`Transaction ${transaction.id} sync ${success ? 'succeeded' : 'failed'}`);
      } catch (txError) {
        console.error(`Error syncing transaction ${transaction.id}:`, txError);
        
        // Store the error result
        results.push({
          transactionId: transaction.id,
          success: false,
          statusCode: 500,
          updated: false,
          oldStatus: transaction.status,
          newStatus: transaction.status,
          error: txError.message || 'Unknown error'
        });
        
        failureCount++;
      }
    }
    
    // Return summary of results
    return new Response(
      JSON.stringify({
        message: `Sync completed: ${successCount} succeeded, ${failureCount} failed`,
        totalProcessed: pendingTransactions.length,
        successCount,
        failureCount,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in admin-sync-all-transactions:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message || 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
