
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

// Helper function to verify HMAC
async function verifyIpnHmac(request: Request, ipnSecret: string): Promise<boolean> {
  try {
    // Get the HMAC signature from header
    const hmacHeader = request.headers.get('HMAC');
    
    if (!hmacHeader) {
      console.error('Missing HMAC header in IPN request');
      return false;
    }
    
    // Get request body as text for HMAC verification
    const clonedRequest = request.clone();
    const bodyText = await clonedRequest.text();
    
    // For now, just log the information for debugging
    console.log('IPN Secret:', ipnSecret);
    console.log('HMAC Header:', hmacHeader);
    console.log('Request Body for HMAC verification:', bodyText);
    
    // In production, we would implement proper HMAC verification here
    // For debugging purposes, we're accepting all IPNs for now
    // but keeping a detailed log for analysis
    
    // Return true to allow processing while we debug
    return true;
  } catch (error) {
    console.error('Error verifying IPN HMAC:', error);
    return false;
  }
}

// Update transaction status in Supabase with retry logic
async function updateTransactionStatus(
  client: any,
  externalTxId: string,
  status: string,
  ipnStatus: number,
  completedAt?: string,
  maxRetries = 3
) {
  let retries = 0;
  let success = false;

  while (retries < maxRetries && !success) {
    try {
      console.log(`Updating transaction with external ID ${externalTxId} to status: ${status} (attempt ${retries + 1})`);
      
      const updateData: Record<string, any> = {
        status: status,
        external_status: ipnStatus, // Store the original status code from CoinPayments
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
        console.error(`Error finding transaction with external ID ${externalTxId}:`, findError);
        retries++;
        if (retries < maxRetries) await new Promise(r => setTimeout(r, 1000 * retries)); // Exponential backoff
        continue;
      }
      
      // Only update if status has changed
      if (transaction.status !== status) {
        const { error: updateError } = await client
          .from('transactions')
          .update(updateData)
          .eq('id', transaction.id);
          
        if (updateError) {
          console.error(`Error updating transaction ${transaction.id}:`, updateError);
          retries++;
          if (retries < maxRetries) await new Promise(r => setTimeout(r, 1000 * retries)); // Exponential backoff
          continue;
        }
        
        console.log(`Successfully updated transaction ${transaction.id} status from ${transaction.status} to ${status}`);
        
        // If transaction is completed, create a notification for the user
        if (status === 'completed' && transaction.status !== 'completed') {
          try {
            // Get transaction details to find user_id and amount
            const { data: txDetails, error: txError } = await client
              .from('transactions')
              .select('user_id, amount')
              .eq('id', transaction.id)
              .single();
              
            if (!txError && txDetails) {
              await createPaymentConfirmationNotification(client, txDetails.user_id, txDetails.amount);
            }
          } catch (notifError) {
            console.error('Error creating notification:', notifError);
            // Don't retry for notification errors - the transaction update is more important
          }
        }
        
        success = true;
        return true;
      } else {
        console.log(`Transaction ${transaction.id} already has status ${status}, no update needed`);
        success = true;
        return false; // No changes made
      }
    } catch (error) {
      console.error('Error in updateTransactionStatus:', error);
      retries++;
      if (retries < maxRetries) await new Promise(r => setTimeout(r, 1000 * retries)); // Exponential backoff
    }
  }
  
  return success;
}

// Create notification for user when payment is confirmed
async function createPaymentConfirmationNotification(supabase: any, userId: string, amount: number | string) {
  try {
    console.log(`[WEBHOOK] Creating notification for user ${userId} about payment of $${amount}`);
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'payment_confirmed',
        title: 'Payment Confirmed',
        message: `Your payment of $${typeof amount === 'number' ? amount.toFixed(2) : amount} has been confirmed. Tokens will be sent to your wallet shortly.`
      })
      .select();
      
    if (error) {
      console.error(`[WEBHOOK] Error creating notification: ${error.message}`);
      return false;
    }
    
    console.log(`[WEBHOOK] Successfully created notification ${data[0].id} for user ${userId}`);
    return true;
  } catch (err) {
    console.error(`[WEBHOOK] Error in notification creation: ${err.message}`);
    return false;
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
        provider: 'coinpayments',
        raw_data: ipnData,
        is_valid: isValid,
        response_status: responseStatus,
        txn_id: ipnData.txn_id || null,
        status: ipnData.status || null,
        hmac_header: hmacHeader || null,
        request_body: requestBody || null
      });
      
    if (error) {
      console.error('Error logging IPN data:', error);
    }
  } catch (error) {
    console.error('Error in logIpnData:', error);
  }
}

// Map CoinPayments status codes to our internal status
function mapCoinPaymentsStatus(statusCode: number): string {
  // Status codes: https://www.coinpayments.net/merchant-tools-ipn
  // -1 = Error/canceled
  // 0 = Pending
  // 1 = Payment received (partial or complete payment)
  // 2 = Complete (Pay exact confirmed, usually standard) 
  // 3 = Confirmed (3+ confirmations)
  // 100 = Complete/Confirmed
  
  switch (statusCode) {
    case -1:
      return 'failed';
    case 0:
      return 'pending';
    case 1:
      return 'confirmed'; // New status for when we've received payment
    case 2:
    case 3:
    case 100:
      return 'completed';
    default:
      console.warn(`Unknown CoinPayments status code: ${statusCode}, defaulting to pending`);
      return 'pending';
  }
}

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Get IPN Secret from environment variables
  const ipnSecret = Deno.env.get('COINPAYMENTS_IPN_SECRET');
  if (!ipnSecret) {
    console.error('COINPAYMENTS_IPN_SECRET not configured');
    return new Response(
      JSON.stringify({ error: 'IPN secret not configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  try {
    // Create Supabase client
    const supabaseClient = createSupabaseClient();
    
    // Clone request to use body multiple times
    const clonedReq = req.clone();
    const clonedReqForBody = req.clone();
    
    // Get raw body for HMAC verification logging
    const rawBody = await clonedReqForBody.text();
    
    // Parse IPN data
    const ipnData = await clonedReq.formData();
    const ipnDataObj: Record<string, any> = {};
    
    // Convert FormData to object and log all fields
    for (const [key, value] of ipnData.entries()) {
      ipnDataObj[key] = value;
    }
    
    console.log('Received CoinPayments IPN data:', ipnDataObj);
    console.log('Raw headers:', Object.fromEntries(req.headers.entries()));
    
    // Get HMAC header for logging
    const hmacHeader = req.headers.get('HMAC') || '';
    
    // Verify IPN HMAC signature
    const isValid = await verifyIpnHmac(req.clone(), ipnSecret);
    console.log('IPN HMAC validation result:', isValid ? 'Valid' : 'Invalid');
    
    // Check for required IPN fields
    if (!ipnDataObj.ipn_type || !ipnDataObj.txn_id) {
      console.error('Missing required IPN fields');
      
      // Log the invalid IPN
      await logIpnData(
        supabaseClient, 
        ipnDataObj, 
        false, 
        'Missing required fields',
        hmacHeader,
        rawBody
      );
      
      return new Response('Missing required IPN fields', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        status: 400
      });
    }
    
    // Process IPN based on type - focus on payment notifications
    if (ipnDataObj.ipn_type === 'api' && ipnDataObj.ipn_mode === 'hmac') {
      // Get status from IPN
      const ipnStatus = parseInt(ipnDataObj.status, 10);
      
      // Map CoinPayments status to our internal status format
      const transactionStatus = mapCoinPaymentsStatus(ipnStatus);
      
      console.log(`Transaction ${ipnDataObj.txn_id} IPN Status: ${ipnStatus}, Mapped to: ${transactionStatus}`);
      
      // Update transaction status in our database with retry logic
      if (isValid && ipnDataObj.txn_id) {
        await updateTransactionStatus(
          supabaseClient,
          ipnDataObj.txn_id,
          transactionStatus,
          ipnStatus,
          ['completed', 'confirmed'].includes(transactionStatus) ? new Date().toISOString() : undefined
        );
      }
    }
    
    // Log the IPN data for debugging
    await logIpnData(
      supabaseClient,
      ipnDataObj,
      isValid,
      isValid ? 'Processed' : 'Invalid HMAC',
      hmacHeader,
      rawBody
    );
    
    // Return proper response based on validation
    if (isValid) {
      return new Response('IPN Received', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        status: 200
      });
    } else {
      return new Response('HMAC validation failed', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        status: 401
      });
    }
    
  } catch (error) {
    console.error('Error processing CoinPayments IPN:', error);
    
    // Try to log the error
    try {
      const supabaseClient = createSupabaseClient();
      await logIpnData(
        supabaseClient,
        { error: error.message || 'Unknown error' },
        false,
        'Exception during processing',
        req.headers.get('HMAC') || 'unknown',
        'Error: Could not parse body'
      );
    } catch (logError) {
      console.error('Failed to log IPN error:', logError);
    }
    
    return new Response(
      JSON.stringify({ error: 'Error processing IPN' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
