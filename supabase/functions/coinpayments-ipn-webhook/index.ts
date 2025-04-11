
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
