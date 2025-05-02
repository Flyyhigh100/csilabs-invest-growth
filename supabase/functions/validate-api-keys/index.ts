
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";
import { createSuccessResponse, createErrorResponse, generateCoinPaymentsHMAC } from "./utils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { service, debug = false } = await req.json();
    
    if (service !== 'coinpayments') {
      return createErrorResponse(`Service '${service}' not supported for validation`, 400);
    }

    // Create supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get API keys from environment
    const publicKey = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
    const privateKey = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');
    
    if (!publicKey || !privateKey) {
      return createErrorResponse('CoinPayments API keys not configured', 400, {
        publicKeyExists: !!publicKey,
        privateKeyExists: !!privateKey,
        debug: debug ? true : undefined
      });
    }

    // Create test API request to validate the API keys
    try {
      // Basic request parameters for a simple info request
      const requestData = new URLSearchParams();
      requestData.append('version', '1');
      requestData.append('cmd', 'get_basic_info');
      requestData.append('key', publicKey);
      
      // Create unique nonce
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const nonce = `${timestamp}${randomSuffix}`;
      
      requestData.append('format', 'json');
      requestData.append('nonce', nonce);

      // Create HMAC signature
      const signature = await generateCoinPaymentsHMAC(requestData.toString(), privateKey);
      
      // Make API request
      const response = await fetch('https://www.coinpayments.net/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'HMAC': signature
        },
        body: requestData
      });
      
      // Parse the response
      const data = await response.json();
      
      if (data.error !== 'ok') {
        return createSuccessResponse({
          isValid: false,
          details: `API error: ${data.error}`,
          debug: debug ? { response: data } : undefined
        });
      }
      
      // Keys are valid
      return createSuccessResponse({
        isValid: true,
        details: "CoinPayments API keys are valid",
        username: data.result?.username,
        debug: debug ? { response: data.result } : undefined
      });
      
    } catch (apiError) {
      console.error('API validation error:', apiError);
      
      return createSuccessResponse({
        isValid: false,
        details: `API request failed: ${apiError.message}`,
        debug: debug ? { error: apiError.message } : undefined
      });
    }
    
  } catch (error) {
    console.error('Unhandled exception in validate-api-keys:', error);
    
    return createErrorResponse(
      `Internal server error: ${error.message}`, 
      500,
      { stack: error.stack }
    );
  }
});
