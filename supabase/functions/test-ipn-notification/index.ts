
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as crypto from "https://deno.land/std@0.190.0/crypto/mod.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Generate HMAC signature for testing
async function generateHmac(body: string, secret: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(body)
    );
    
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Error generating HMAC:', error);
    throw error;
  }
}

// Create FormData from object
function objectToFormData(obj: Record<string, any>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(obj)) {
    formData.append(key, String(value));
  }
  return formData;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify we're not in production
    const environment = Deno.env.get('ENVIRONMENT') || 'development';
    if (environment === 'production') {
      return new Response(
        JSON.stringify({ error: 'This endpoint is not available in production' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    // Get the IPN secret for generating test HMAC
    const ipnSecret = Deno.env.get('COINPAYMENTS_IPN_SECRET');
    if (!ipnSecret) {
      return new Response(
        JSON.stringify({ error: 'COINPAYMENTS_IPN_SECRET not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Parse request body
    const { transactionId, status, amount, currency } = await req.json();
    
    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: 'transactionId is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Create test IPN data
    const ipnData = {
      ipn_version: '1.0',
      ipn_type: 'api',
      ipn_mode: 'hmac',
      ipn_id: crypto.randomUUID(),
      merchant: 'TEST_MERCHANT',
      txn_id: transactionId,
      status: status || '100',
      status_text: status === '100' ? 'Complete' : 'Pending',
      currency1: 'USD',
      currency2: currency || 'USDT',
      amount1: amount || '100.00',
      amount2: amount || '100.00',
      fee: '1.00',
      buyer_name: 'Test User',
      email: 'test@example.com',
      received_confirms: '10',
      received_amount: amount || '100.00'
    };
    
    console.log('Test IPN data:', ipnData);
    
    // Create form data for the request
    const formData = objectToFormData(ipnData);
    const formDataBody = await new Response(formData).text();
    
    // Generate HMAC signature
    const hmac = await generateHmac(formDataBody, ipnSecret);
    console.log('Generated HMAC:', hmac.substring(0, 10) + '...');
    
    // Create Supabase client
    const supabase = createSupabaseClient();
    
    // Get the deployed IPN webhook URL
    const ipnWebhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/coinpayments-ipn-webhook`;
    
    // Send the IPN notification to our webhook
    console.log(`Sending test IPN to ${ipnWebhookUrl}`);
    const ipnResponse = await fetch(ipnWebhookUrl, {
      method: 'POST',
      headers: {
        'HMAC': hmac,
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    });
    
    const ipnResult = await ipnResponse.text();
    
    // Log the test
    await supabase
      .from('ipn_logs')
      .insert({
        provider: 'test-ipn-sender',
        raw_data: ipnData,
        is_valid: true,
        response_status: `${ipnResponse.status} ${ipnResponse.statusText}`,
        hmac_header: hmac.substring(0, 20) + '...',
        txn_id: transactionId,
        status: status || '100',
        notes: 'Test IPN notification sent',
        request_body: JSON.stringify(ipnData)
      });
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test IPN notification sent',
        status: ipnResponse.status,
        response: ipnResult,
        ipnData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending test IPN notification:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
