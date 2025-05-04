
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Validate CoinPayments API keys
 */
async function validateCoinPaymentsKeys(debug = false): Promise<any> {
  try {
    // Get API credentials
    const publicKey = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
    const privateKey = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');
    const merchantId = Deno.env.get('COINPAYMENTS_MERCHANT_ID');
    
    if (!publicKey || !privateKey) {
      return {
        isValid: false,
        details: "Missing API keys. Both public and private keys must be set.",
        missingKeys: {
          publicKey: !publicKey,
          privateKey: !privateKey
        }
      };
    }
    
    // Log environment variables for debugging
    if (debug) {
      console.log("Environment variables available:", Object.keys(Deno.env.toObject()).join(", "));
      console.log(`Merchant ID: ${merchantId || 'NOT SET'}`);
    }
    
    // Create a unique nonce
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const nonce = `${timestamp}${randomSuffix}`;
    
    // Build payload
    const queryParams = new URLSearchParams({
      cmd: 'get_basic_info',
      key: publicKey,
      version: '1',
      format: 'json',
      nonce: nonce
    });
    
    // Add merchant ID if available
    if (merchantId) {
      queryParams.append('merchant', merchantId);
      console.log('Added merchant ID to validation request');
    }
    
    const payload = queryParams.toString();
    
    // Create HMAC signature
    const encoder = new TextEncoder();
    const key = encoder.encode(privateKey);
    const message = encoder.encode(payload);
    const cryptoKey = await crypto.subtle.importKey(
      "raw", key, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]
    );
    const signature = await crypto.subtle.sign(
      "HMAC", cryptoKey, message
    );
    
    // Convert signature to hex string
    const hmac = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('').toUpperCase();
    
    // Make API request
    const response = await fetch('https://www.coinpayments.net/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmac
      },
      body: payload
    });
    
    const data = await response.json();
    
    if (debug) {
      console.log('CoinPayments API validation response:', JSON.stringify(data));
    }
    
    // Determine if keys are valid
    if (data.error === 'ok') {
      // Check for merchant-specific fields in response if merchant ID was provided
      if (merchantId && !data.result?.username) {
        return {
          isValid: false,
          details: "API keys valid but merchant ID may be incorrect or missing permissions.",
          rawResponse: debug ? data : undefined,
          merchantIdProvided: !!merchantId
        };
      }
      
      return {
        isValid: true,
        details: "API keys validated successfully.",
        merchantIdDetected: !!merchantId,
        rawResponse: debug ? data : undefined
      };
    } else {
      return {
        isValid: false,
        details: `API validation failed: ${data.error}`,
        rawResponse: debug ? data : undefined
      };
    }
  } catch (error) {
    console.error('Error validating CoinPayments API keys:', error);
    return {
      isValid: false,
      details: `Error during validation: ${error.message || 'Unknown error'}`,
      error: error.message
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid JSON in request body'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
    
    // Extract service and debug flag
    const { service, debug = false } = requestBody;
    
    if (!service) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing service parameter'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
    
    // Validate based on service
    let result;
    if (service.toLowerCase() === 'coinpayments') {
      result = await validateCoinPaymentsKeys(debug);
    } else {
      result = {
        isValid: false,
        details: `Unsupported service: ${service}`
      };
    }
    
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('Unhandled exception:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: `Internal server error: ${error.message || 'Unknown error'}`
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
