
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

// Handle force updating a transaction status
async function forceUpdateTransactionStatus(
  client, 
  transactionId = null,
  externalTransactionId = null,
  forceStatus = null
) {
  try {
    console.log(`[FORCE-UPDATE] Request to update transaction: ${transactionId || externalTransactionId} to status: ${forceStatus}`);
    
    // Validate inputs
    if (!transactionId && !externalTransactionId) {
      console.error('[FORCE-UPDATE] No transaction identifier provided');
      return { 
        success: false, 
        message: 'Either transaction_id or external_transaction_id must be provided' 
      };
    }
    
    if (!forceStatus) {
      console.error('[FORCE-UPDATE] No status provided');
      return { 
        success: false, 
        message: 'Force status must be provided' 
      };
    }
    
    // Build the query to find the transaction
    let query = client
      .from('transactions')
      .select('*');
      
    if (transactionId) {
      query = query.eq('id', transactionId);
    } else if (externalTransactionId) {
      query = query.eq('external_transaction_id', externalTransactionId);
      
      // If no match, try with transaction_id field as fallback
      const { data: firstTry, error: firstError } = await query.maybeSingle();
      
      if (!firstTry) {
        console.log('[FORCE-UPDATE] No match for external_transaction_id, trying transaction_id field');
        query = client
          .from('transactions')
          .select('*')
          .eq('transaction_id', externalTransactionId);
      } else {
        // Return to original query if we found something
        query = client
          .from('transactions')
          .select('*')
          .eq('external_transaction_id', externalTransactionId);
      }
    }
    
    // Execute query
    const { data: transaction, error: txError } = await query.maybeSingle();
      
    if (txError) {
      console.error(`[FORCE-UPDATE] Error fetching transaction:`, txError);
      return { 
        success: false, 
        message: `Database error: ${txError.message}` 
      };
    }
    
    if (!transaction) {
      console.error(`[FORCE-UPDATE] Transaction not found`);
      return { 
        success: false, 
        message: `Transaction not found. Please verify the ID.` 
      };
    }
    
    console.log(`[FORCE-UPDATE] Found transaction ${transaction.id} with status ${transaction.status}`);
    
    // Update the transaction status
    const updateData = {
      status: forceStatus,
      updated_at: new Date().toISOString()
    };
    
    // Set completed_at if status is completed or confirmed
    if (forceStatus === 'completed' || forceStatus === 'confirmed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { error: updateError } = await client
      .from('transactions')
      .update(updateData)
      .eq('id', transaction.id);
      
    if (updateError) {
      console.error(`[FORCE-UPDATE] Error updating transaction:`, updateError);
      return { 
        success: false, 
        message: `Error updating transaction: ${updateError.message}` 
      };
    }
    
    console.log(`[FORCE-UPDATE] Successfully updated transaction ${transaction.id} status to ${forceStatus}`);
    
    // Add user notification
    try {
      await client
        .from('notifications')
        .insert({
          user_id: transaction.user_id,
          type: `payment_${forceStatus}`,
          title: `Payment Status Updated`,
          message: `Your cryptocurrency payment has been updated to: ${forceStatus}.`
        });
      console.log(`[FORCE-UPDATE] Notification created for user ${transaction.user_id}`);
    } catch (notifError) {
      console.warn(`[FORCE-UPDATE] Error creating notification:`, notifError);
      // Continue despite notification error
    }
    
    // Add a record to ipn_logs about this manual update
    try {
      await client
        .from('ipn_logs')
        .insert({
          provider: 'manual',
          txn_id: transaction.external_transaction_id || transaction.transaction_id,
          status: forceStatus,
          raw_data: { 
            manual_update: true,
            timestamp: new Date().toISOString()
          },
          processing_status: 'processed_manually',
          processed_at: new Date().toISOString(),
          details: JSON.stringify({
            transaction_id: transaction.id,
            old_status: transaction.status,
            new_status: forceStatus,
            manual_update: true
          })
        });
      console.log(`[FORCE-UPDATE] IPN log entry created for manual status update`);
    } catch (logError) {
      console.warn(`[FORCE-UPDATE] Error creating IPN log:`, logError);
      // Continue despite log error
    }
    
    return { 
      success: true, 
      message: `Transaction ${transaction.id} updated from ${transaction.status} to ${forceStatus}`,
      transaction_id: transaction.id,
      old_status: transaction.status,
      new_status: forceStatus
    };
  } catch (error) {
    console.error(`[FORCE-UPDATE] Unexpected error:`, error);
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
    const { transaction_id, external_transaction_id, force_status } = body;
    
    if ((!transaction_id && !external_transaction_id) || !force_status) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required parameters: either transaction_id or external_transaction_id, and force_status'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // Process the force status update
    const result = await forceUpdateTransactionStatus(
      client, 
      transaction_id, 
      external_transaction_id, 
      force_status
    );
    
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
