
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Create Supabase client
function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Update transaction status in Supabase
async function updateTransactionStatus(
  client: any,
  externalTxId: string,
  status: string,
  completedAt?: string
) {
  try {
    console.log(`[TEST-IPN] Updating transaction with external ID ${externalTxId} to status: ${status}`);
    
    const updateData: Record<string, any> = {
      status: status,
      updated_at: new Date().toISOString()
    };
    
    if (completedAt) {
      updateData.completed_at = completedAt;
    }
    
    // First, find the transaction by external_transaction_id
    const { data: transaction, error: findError } = await client
      .from('transactions')
      .select('id, status')
      .eq('external_transaction_id', externalTxId)
      .single();
      
    if (findError || !transaction) {
      console.error(`[TEST-IPN] Error finding transaction with external ID ${externalTxId}:`, findError);
      return { 
        success: false, 
        message: `Transaction not found with external ID: ${externalTxId}`,
        error: findError?.message
      };
    }
    
    // Only update if status is different
    if (transaction.status !== status) {
      const { error: updateError } = await client
        .from('transactions')
        .update(updateData)
        .eq('id', transaction.id);
        
      if (updateError) {
        console.error(`[TEST-IPN] Error updating transaction ${transaction.id}:`, updateError);
        return { 
          success: false, 
          message: `Failed to update transaction ${transaction.id}`,
          error: updateError.message
        };
      }
      
      console.log(`[TEST-IPN] Successfully updated transaction ${transaction.id} status from ${transaction.status} to ${status}`);
      return { 
        success: true, 
        message: `Transaction ${transaction.id} updated from ${transaction.status} to ${status}`,
        transactionId: transaction.id
      };
    } else {
      console.log(`[TEST-IPN] Transaction ${transaction.id} already has status ${status}, no update needed`);
      return { 
        success: true, 
        message: `Transaction ${transaction.id} already has status ${status}, no update needed`,
        transactionId: transaction.id,
        noChange: true
      };
    }
  } catch (error) {
    console.error('[TEST-IPN] Error in updateTransactionStatus:', error);
    return { 
      success: false, 
      message: 'Exception during transaction update',
      error: error.message
    };
  }
}

// Log IPN data to a dedicated log table for debugging
async function logIpnData(
  client: any, 
  ipnData: any, 
  isValid: boolean, 
  responseStatus: string,
  hmacHeader?: string,
  requestBody?: string
) {
  try {
    const { error } = await client
      .from('ipn_logs')
      .insert({
        provider: 'test-coinpayments',
        raw_data: ipnData,
        is_valid: isValid,
        response_status: responseStatus,
        txn_id: ipnData.txn_id || null,
        status: ipnData.status || null,
        hmac_header: hmacHeader || 'test-hmac',
        request_body: requestBody || JSON.stringify(ipnData)
      });
      
    if (error) {
      console.error('[TEST-IPN] Error logging IPN data:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('[TEST-IPN] Error in logIpnData:', error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Verify this is only used in development/test environments
    const environment = Deno.env.get('ENVIRONMENT') || 'development';
    if (environment === 'production') {
      return new Response(
        JSON.stringify({ 
          error: 'This endpoint is only available in development environments' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 403 
        }
      );
    }
    
    // Create Supabase client
    const supabaseClient = createSupabaseClient();
    
    // Parse IPN data (could be JSON or form data)
    let ipnDataObj: Record<string, any> = {};
    let isJsonPayload = false;
    
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      // Handle JSON payload
      ipnDataObj = await req.json();
      isJsonPayload = true;
    } else if (contentType.includes('application/x-www-form-urlencoded') || 
               contentType.includes('multipart/form-data')) {
      // Handle form data
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        ipnDataObj[key] = value;
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported content type' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }
    
    console.log('[TEST-IPN] Received test IPN data:', ipnDataObj);
    
    // Validate required fields
    if (!ipnDataObj.ipn_type || !ipnDataObj.txn_id) {
      const errorMessage = 'Missing required IPN fields (ipn_type, txn_id)';
      console.error(`[TEST-IPN] ${errorMessage}`);
      
      // Log the invalid IPN
      await logIpnData(
        supabaseClient,
        ipnDataObj, 
        false, 
        errorMessage
      );
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: errorMessage
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }
    
    // Process IPN
    let updateResult = null;
    let statusMessage = 'Received';
    
    if (ipnDataObj.ipn_type === 'api') {
      // Get status from IPN
      const ipnStatus = parseInt(ipnDataObj.status, 10);
      let transactionStatus = 'pending';
      
      // Map CoinPayments status to our status format
      if (ipnStatus < 0) {
        transactionStatus = 'failed';
      } else if (ipnStatus === 0) {
        transactionStatus = 'pending';
      } else if (ipnStatus >= 1) {
        // All status values >= 1 should be considered completed
        transactionStatus = 'completed';
      }
      
      console.log(`[TEST-IPN] Transaction ${ipnDataObj.txn_id} IPN Status: ${ipnStatus}, Mapped to: ${transactionStatus}`);
      
      // Update transaction status in our database
      updateResult = await updateTransactionStatus(
        supabaseClient,
        ipnDataObj.txn_id,
        transactionStatus,
        transactionStatus === 'completed' ? new Date().toISOString() : undefined
      );
      
      statusMessage = updateResult.message;
    }
    
    // Log the test IPN data
    const logResult = await logIpnData(
      supabaseClient,
      ipnDataObj,
      true,
      statusMessage
    );
    
    // Return response with details
    return new Response(
      JSON.stringify({
        success: updateResult ? updateResult.success : true,
        message: updateResult ? updateResult.message : 'IPN logged but no transaction update was performed',
        ipn_processed: true,
        ipn_logged: logResult.success,
        details: {
          txn_id: ipnDataObj.txn_id,
          status: ipnDataObj.status,
          transaction_update: updateResult,
          log_result: logResult
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
  } catch (error) {
    console.error('[TEST-IPN] Error processing test IPN:', error);
    
    // Try to create Supabase client for logging
    try {
      const supabaseClient = createSupabaseClient();
      await logIpnData(
        supabaseClient,
        { error: error.message || 'Unknown error' },
        false,
        'Exception during processing'
      );
    } catch (logError) {
      console.error('[TEST-IPN] Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error processing IPN',
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
