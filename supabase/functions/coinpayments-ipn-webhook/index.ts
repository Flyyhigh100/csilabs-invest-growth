
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSupabaseClient } from "./db-client.ts";
import { verifyIpnHmac } from "./verification.ts";
import { logIpnData } from "./logging.ts";
import { updateTransactionStatus } from "./transaction-handler.ts";
import { mapCoinPaymentsStatus } from "./status-mapper.ts";

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // IMPORTANT: Send immediate 200 response first to acknowledge receipt to CoinPayments
  // This prevents CoinPayments from retrying the webhook unnecessarily
  const response = new Response('IPN Received', {
    headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    status: 200
  });

  try {
    // Get IPN Secret from environment variables
    const ipnSecret = Deno.env.get('COINPAYMENTS_IPN_SECRET');
    if (!ipnSecret) {
      console.error('COINPAYMENTS_IPN_SECRET not configured');
      // Still return 200 to prevent retries, but log the error
      return response;
    }

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
    
    console.log('Received CoinPayments IPN data:', JSON.stringify(ipnDataObj));
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
      
      // Still return 200 to prevent retries
      return response;
    }
    
    // Process IPN based on type - focus on payment notifications
    if (ipnDataObj.ipn_type === 'api' && ipnDataObj.ipn_mode === 'hmac') {
      // Get status from IPN
      const ipnStatus = parseInt(ipnDataObj.status, 10);
      
      console.log(`Transaction ${ipnDataObj.txn_id} IPN Status: ${ipnStatus}`);
      
      // Direct status code handling as requested
      let transactionStatus = 'pending';
      
      // Update transaction if payment received (status 1) or fully processed (status >= 100)
      if (ipnStatus >= 100 || ipnStatus === 1) {
        console.log(`Updating transaction ${ipnDataObj.txn_id} to completed status`);
        transactionStatus = 'completed';
      } else if (ipnStatus < 0) {
        transactionStatus = 'failed';
      }
      
      // Update transaction status in our database with retry logic
      if (isValid && ipnDataObj.txn_id) {
        const updated = await updateTransactionStatus(
          supabaseClient,
          ipnDataObj.txn_id,
          transactionStatus,
          ipnStatus,
          ['completed', 'confirmed'].includes(transactionStatus) ? new Date().toISOString() : undefined
        );
        
        console.log(`Transaction status update result: ${updated ? 'Updated' : 'No change needed'}`);
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
    
    // Return proper response (already created at the beginning)
    return response;
    
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
    
    // Always return 200 to prevent retries from CoinPayments
    return response;
  }
});
