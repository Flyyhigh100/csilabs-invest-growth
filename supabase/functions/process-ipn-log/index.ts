
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

// Process an IPN log entry to update a transaction
async function processIPNLog(client, ipnLogId, forceProcess = false) {
  try {
    console.log(`[PROCESS-IPN] Processing IPN log ${ipnLogId}, force=${forceProcess}`);
    
    // Fetch the IPN log entry
    const { data: ipnLog, error: logError } = await client
      .from('ipn_logs')
      .select('*')
      .eq('id', ipnLogId)
      .single();
      
    if (logError || !ipnLog) {
      console.error(`[PROCESS-IPN] Error fetching IPN log ${ipnLogId}:`, logError);
      return { 
        success: false, 
        message: `IPN log ${ipnLogId} not found: ${logError?.message || 'Unknown error'}` 
      };
    }
    
    // Display IPN log data for debugging
    console.log(`[PROCESS-IPN] IPN Log data:`, JSON.stringify({
      id: ipnLog.id,
      provider: ipnLog.provider,
      txn_id: ipnLog.txn_id,
      status: ipnLog.status,
      created_at: ipnLog.created_at
    }));
    
    // Extract transaction ID from the IPN data
    const txnId = ipnLog.txn_id;
    if (!txnId) {
      console.error(`[PROCESS-IPN] No txn_id in IPN log ${ipnLogId}`);
      return { 
        success: false, 
        message: 'No transaction ID in IPN log' 
      };
    }
    
    console.log(`[PROCESS-IPN] Looking up transaction with external_transaction_id: ${txnId}`);
    
    // Find the transaction by external_transaction_id
    const { data: transaction, error: txError } = await client
      .from('transactions')
      .select('*')
      .eq('external_transaction_id', txnId)
      .maybeSingle();
      
    if (txError) {
      console.error(`[PROCESS-IPN] Error fetching transaction:`, txError);
      return { 
        success: false, 
        message: `Database error: ${txError.message}` 
      };
    }
    
    if (!transaction) {
      console.error(`[PROCESS-IPN] Transaction not found for external_transaction_id: ${txnId}`);
      
      // Try with transaction_id as fallback
      const { data: fallbackTx, error: fallbackError } = await client
        .from('transactions')
        .select('*')
        .eq('transaction_id', txnId)
        .maybeSingle();
        
      if (fallbackError || !fallbackTx) {
        // Get a few sample transactions for debugging
        const { data: sampleTxs } = await client
          .from('transactions')
          .select('id, external_transaction_id, transaction_id, status')
          .limit(5);
          
        console.log(`[PROCESS-IPN] Sample transactions in DB:`, JSON.stringify(sampleTxs || []));
        
        return { 
          success: false, 
          message: `Transaction not found for external ID: ${txnId}. Please verify the transaction exists.`,
          details: `Searched for external_transaction_id and transaction_id matching '${txnId}'`
        };
      }
      
      console.log(`[PROCESS-IPN] Found transaction using transaction_id field instead: ${fallbackTx.id}`);
      
      // Continue with the fallback transaction
      return updateTransactionStatus(client, fallbackTx, ipnLog, forceProcess);
    }
    
    // Found transaction with external_transaction_id
    console.log(`[PROCESS-IPN] Found transaction: ${transaction.id} with status ${transaction.status}`);
    return updateTransactionStatus(client, transaction, ipnLog, forceProcess);
    
  } catch (error) {
    console.error('Exception in processIPNLog:', error);
    return { 
      success: false, 
      message: `Exception: ${error.message}`,
      details: error.stack
    };
  }
}

async function updateTransactionStatus(
  client, 
  transaction, 
  ipnLog, 
  forceProcess = false
) {
  try {
    console.log(`[PROCESS-IPN] Updating transaction ${transaction.id} with status from IPN`);
    
    // Extract status from IPN data
    const rawData = ipnLog.raw_data || {};
    const ipnStatus = parseInt(rawData.status || ipnLog.status || '0', 10);
    
    console.log(`[PROCESS-IPN] Raw IPN status: ${ipnStatus} (${typeof ipnStatus})`);
    
    // Map the IPN status code to our internal status
    let newStatus = 'pending';
    if (ipnStatus < 0) {
      newStatus = 'failed';
    } else if (ipnStatus === 0) {
      newStatus = 'pending';
    } else if (ipnStatus >= 1) { 
      // Status 1 or greater should now be treated as completed
      newStatus = 'completed';
      
      // Special logging for BNB transactions
      const currency = rawData.currency || transaction.currency || 'unknown';
      if (currency === 'BNB') {
        console.log(`[PROCESS-IPN] BNB transaction detected with status ${ipnStatus} - marking as completed`);
      }
    }
    
    console.log(`[PROCESS-IPN] Mapped IPN status ${ipnStatus} to: ${newStatus}`);
    
    // Check if the status needs updating
    if (transaction.status === newStatus && !forceProcess) {
      console.log(`[PROCESS-IPN] Transaction already has status ${newStatus}, no update needed`);
      return { 
        success: true, 
        message: `Transaction ${transaction.id} already has status ${newStatus}, no update needed`,
        no_change: true,
        transaction_id: transaction.id,
        status: newStatus
      };
    }
    
    // Prepare update data
    const updateData = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    // Set completed_at if status is completed
    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    // Update the transaction
    const { error: updateError } = await client
      .from('transactions')
      .update(updateData)
      .eq('id', transaction.id);
      
    if (updateError) {
      console.error(`[PROCESS-IPN] Error updating transaction:`, updateError);
      return { 
        success: false, 
        message: `Error updating transaction: ${updateError.message}` 
      };
    }
    
    console.log(`[PROCESS-IPN] Successfully updated transaction ${transaction.id} status from ${transaction.status} to ${newStatus}`);
    
    // Add user notification
    try {
      await client
        .from('notifications')
        .insert({
          user_id: transaction.user_id,
          type: `payment_${newStatus}`,
          title: `Payment ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
          message: `Your cryptocurrency payment of $${transaction.amount} has been ${newStatus}.`
        });
      console.log(`[PROCESS-IPN] Notification created for user ${transaction.user_id}`);
    } catch (notifError) {
      console.warn(`[PROCESS-IPN] Error creating notification:`, notifError);
      // Continue despite notification error
    }
    
    // Update the IPN log with processing details
    await client
      .from('ipn_logs')
      .update({
        processing_status: forceProcess ? 'processed_manually' : 'processed',
        processed_at: new Date().toISOString(),
        details: JSON.stringify({
          transaction_id: transaction.id,
          old_status: transaction.status,
          new_status: newStatus,
          force_processed: forceProcess
        })
      })
      .eq('id', ipnLog.id);
    
    return { 
      success: true, 
      message: `Transaction ${transaction.id} updated from ${transaction.status} to ${newStatus}`,
      transaction_id: transaction.id,
      old_status: transaction.status,
      new_status: newStatus
    };
  } catch (error) {
    console.error(`[PROCESS-IPN] Unexpected error:`, error);
    return { 
      success: false, 
      message: `Unexpected error: ${error.message}`,
      details: error.stack
    };
  }
}

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const client = createSupabaseClient();
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("Request body:", JSON.stringify(body));
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid JSON in request body'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // Extract parameters
    const { ipn_log_id, force_process } = body;
    
    if (!ipn_log_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required parameter: ipn_log_id'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // Process the IPN log
    const result = await processIPNLog(client, ipn_log_id, force_process);
    
    // Return response
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Error processing request: ${error.message}`,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
