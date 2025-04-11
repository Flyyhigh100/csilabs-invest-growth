
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
        message: `IPN log ${ipnLogId} not found` 
      };
    }
    
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
      return { 
        success: false, 
        message: `Transaction not found for external ID: ${txnId}` 
      };
    }
    
    // Extract status from IPN data
    const rawData = ipnLog.raw_data || {};
    const ipnStatus = parseInt(rawData.status || ipnLog.status || '0', 10);
    
    // Map the IPN status code to our internal status
    let newStatus = 'pending';
    if (ipnStatus < 0) {
      newStatus = 'failed';
    } else if (ipnStatus === 0) {
      newStatus = 'pending';
    } else if (ipnStatus >= 100) {
      newStatus = 'completed';
    } else if (ipnStatus >= 1) {
      newStatus = 'confirmed';
    }
    
    console.log(`[PROCESS-IPN] Mapped IPN status ${ipnStatus} to: ${newStatus}`);
    
    // Check if the status needs updating
    if (transaction.status === newStatus && !forceProcess) {
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
    
    // Set completed_at if status is completed or confirmed
    if (newStatus === 'completed' || newStatus === 'confirmed') {
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
    } catch (notifError) {
      console.warn(`[PROCESS-IPN] Error creating notification:`, notifError);
      // Continue despite notification error
    }
    
    // Update the IPN log with processing details
    await client
      .from('ipn_logs')
      .update({
        processing_status: 'processed_manually',
        processed_at: new Date().toISOString(),
        details: JSON.stringify({
          transaction_id: transaction.id,
          old_status: transaction.status,
          new_status: newStatus,
          force_processed: forceProcess
        })
      })
      .eq('id', ipnLogId);
    
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
      message: `Unexpected error: ${error.message}` 
    };
  }
}

// Force update a transaction status
async function forceUpdateTransactionStatus(client, txId, externalId, newStatus) {
  try {
    console.log(`[FORCE-UPDATE] Updating transaction status - ID: ${txId}, External ID: ${externalId}, Status: ${newStatus}`);
    
    // Build query based on available IDs
    let query = client.from('transactions').update({
      status: newStatus,
      updated_at: new Date().toISOString()
    });
    
    if (txId) {
      query = query.eq('id', txId);
    } else if (externalId) {
      query = query.eq('external_transaction_id', externalId);
    } else {
      return {
        success: false,
        message: 'No transaction identifiers provided'
      };
    }
    
    // Execute update
    const { data, error } = await query.select().maybeSingle();
    
    if (error) {
      console.error(`[FORCE-UPDATE] Database error:`, error);
      return {
        success: false,
        message: `Database error: ${error.message}`
      };
    }
    
    if (!data) {
      return {
        success: false,
        message: 'Transaction not found'
      };
    }
    
    console.log(`[FORCE-UPDATE] Transaction ${data.id} status updated to ${newStatus}`);
    
    // Create user notification
    try {
      await client.from('notifications').insert({
        user_id: data.user_id,
        type: `payment_${newStatus}`,
        title: `Payment Status Updated`,
        message: `Your payment has been manually updated to: ${newStatus}`
      });
    } catch (notifError) {
      console.warn(`[FORCE-UPDATE] Failed to create notification:`, notifError);
      // Continue despite error
    }
    
    return {
      success: true,
      message: `Transaction ${data.id} status updated to ${newStatus}`,
      transaction: data
    };
  } catch (error) {
    console.error(`[FORCE-UPDATE] Unexpected error:`, error);
    return {
      success: false,
      message: `Unexpected error: ${error.message}`
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
    const body = await req.json();
    
    // Extract parameters based on endpoint functionality
    const { 
      ipn_log_id, 
      force_process,
      transaction_id,
      external_transaction_id,
      force_status
    } = body;
    
    let result;
    
    // Either process an IPN log or force update a transaction status
    if (ipn_log_id) {
      result = await processIPNLog(client, ipn_log_id, force_process);
    } else if (force_status) {
      result = await forceUpdateTransactionStatus(
        client, 
        transaction_id, 
        external_transaction_id, 
        force_status
      );
    } else {
      result = {
        success: false,
        message: 'Missing required parameters'
      };
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Error processing request: ${error.message}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
