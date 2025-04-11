
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";
import * as crypto from "https://deno.land/std@0.177.0/crypto/crypto.ts";

// CORS headers for the response
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

async function validateCoinPaymentsKeys() {
  try {
    const publicKey = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
    const privateKey = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');
    const ipnSecret = Deno.env.get('COINPAYMENTS_IPN_SECRET');
    
    if (!publicKey || !privateKey) {
      return { 
        isValid: false, 
        details: 'Missing API keys',
        missing: {
          publicKey: !publicKey,
          privateKey: !privateKey,
          ipnSecret: !ipnSecret
        }
      };
    }
    
    console.log('API key info', { 
      publicKeyLength: publicKey.length, 
      privateKeyLength: privateKey.length,
      ipnSecretPresent: !!ipnSecret
    });
    
    // Create a payload for info request
    const payload = {
      version: 1,
      cmd: 'get_basic_info',
      key: publicKey,
      format: 'json'
    };
    
    // Generate HMAC signature
    const hmac = await createHMAC(privateKey, payload);
    
    // Make request to CoinPayments API
    console.log('CoinPayments API Request - Testing access');
    const apiUrl = 'https://www.coinpayments.net/api.php';
    const formData = new FormData();
    
    // Add all fields to the form data
    for (const [key, value] of Object.entries(payload)) {
      formData.append(key, String(value));
    }
    
    // Add HMAC signature
    formData.append('hmac', hmac);
    
    // Make request
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData
    });
    
    // Check response
    if (!response.ok) {
      console.error('CoinPayments API error - HTTP', response.status, response.statusText);
      return { 
        isValid: false, 
        details: `HTTP error: ${response.status} ${response.statusText}`,
        httpError: true
      };
    }
    
    // Parse response
    const data = await response.json();
    console.log('CoinPayments API response', {
      error: data.error,
      result: data.result ? 'data present' : 'no data'
    });
    
    if (data.error !== 'ok') {
      return { 
        isValid: false, 
        details: `API error: ${data.error}`,
        apiError: data.error,
        rawResponse: data
      };
    }
    
    // Check IPN secret
    const ipnStatus = ipnSecret ? {
      ipnSecretConfigured: true,
      ipnSecretLength: ipnSecret.length,
    } : {
      ipnSecretConfigured: false,
      warning: 'IPN secret is not configured, which may affect webhook notifications'
    };
    
    return { 
      isValid: true, 
      details: 'API keys are valid',
      merchantId: data.result?.merchant_id,
      publicName: publicKey.substring(0, 5) + '...' + publicKey.substring(publicKey.length - 5),
      ipnStatus,
      rawResponse: data.result
    };
  } catch (error) {
    console.error('Error validating CoinPayments keys:', error);
    return { 
      isValid: false, 
      details: `Exception: ${error.message}`,
      exceptionDetails: error.stack || 'No stack trace available',
    };
  }
}

// Create an HMAC signature for the CoinPayments API request
async function createHMAC(privateKey: string, payload: Record<string, any>): Promise<string> {
  // Convert payload to query string format but without the private key
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(payload)) {
    params.append(key, String(value));
  }
  const queryString = params.toString();
  
  // Create HMAC
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(privateKey),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(queryString)
  );
  
  // Convert to hex
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for service to validate
    const requestData = await req.json();
    const { service } = requestData;
    
    if (!service) {
      return new Response(
        JSON.stringify({ error: 'Missing service parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let result;
    
    // Validate different service APIs
    switch (service.toLowerCase()) {
      case 'coinpayments':
        result = await validateCoinPaymentsKeys();
        break;
        
      // Add more services as needed
      
      default:
        return new Response(
          JSON.stringify({ error: `Service "${service}" validation not implemented` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in validate-api-keys function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
