import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, testHmacSignature, generateCoinPaymentsHMAC } from "./utils.ts";

async function validateDefinedFiKey() {
  try {
    const apiKey = Deno.env.get('DEFINED_API_KEY');
    
    if (!apiKey) {
      return { 
        isValid: false, 
        details: 'API key not configured',
        service: 'defined.fi',
      };
    }
    
    if (apiKey.length < 30) {
      return {
        isValid: false,
        details: 'API key appears to be invalid (incorrect format or length)',
        service: 'defined.fi',
      };
    }

    try {
      const response = await fetch('https://api.defined.fi/api/v1/healthcheck', {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return {
          isValid: true,
          details: 'Defined.fi API key is valid and working correctly',
          service: 'defined.fi',
          response: {
            success: true,
            status: response.status,
            data: data
          }
        };
      } else {
        return {
          isValid: false,
          details: `API response error: ${response.status} ${response.statusText}`,
          service: 'defined.fi',
          response: {
            error: data
          }
        };
      }
    } catch (apiError) {
      console.error('Error testing Defined.fi API:', apiError);
      return {
        isValid: false,
        details: `Error testing API connection: ${apiError.message}`,
        service: 'defined.fi',
        error: apiError.message
      };
    }
    
  } catch (error) {
    console.error('Error validating Defined.fi key:', error);
    return { 
      isValid: false,
      details: `Exception: ${error.message}`,
      service: 'defined.fi',
      exceptionDetails: error.stack || 'No stack trace available',
    };
  }
}

async function validateCoinPaymentsKeys() {
  try {
    const publicKey = Deno.env.get('COINPAYMENTS_PUBLIC_KEY')?.trim();
    const privateKey = Deno.env.get('COINPAYMENTS_PRIVATE_KEY')?.trim();
    const ipnSecret = Deno.env.get('COINPAYMENTS_IPN_SECRET')?.trim();
    
    if (!publicKey || !privateKey) {
      return { 
        isValid: false, 
        details: 'Missing API keys',
        service: 'coinpayments',
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
    
    const isPublicKeyValid = publicKey.length >= 40;
    const isPrivateKeyValid = privateKey.length >= 40;
    
    if (!isPublicKeyValid || !isPrivateKeyValid) {
      return {
        isValid: false,
        details: 'API keys appear to be invalid (incorrect format or length)',
        service: 'coinpayments',
        keyCheck: {
          publicKeyValid: isPublicKeyValid,
          privateKeyValid: isPrivateKeyValid
        }
      };
    }

    const hmacValid = await testHmacSignature(privateKey);
    if (!hmacValid) {
      return {
        isValid: false,
        details: 'Private key failed HMAC signature test',
        service: 'coinpayments'
      };
    }

    try {
      const params = {
        version: '1',
        cmd: 'get_basic_info',
        key: publicKey,
        format: 'json',
        nonce: Math.floor(Date.now() / 1000).toString()
      };
      
      const encodedParams = new URLSearchParams(params).toString();
      console.log('[CoinPayments] Request parameters:', encodedParams);
      
      const hmac = await generateCoinPaymentsHMAC(encodedParams, privateKey);
      
      console.log('[CoinPayments] Making API request with generated HMAC');
      
      const response = await fetch('https://www.coinpayments.net/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'HMAC': hmac
        },
        body: encodedParams
      });
      
      const data = await response.json();
      console.log('[CoinPayments] API response:', JSON.stringify(data).substring(0, 200) + '...');
      
      if (data.error === 'ok') {
        return {
          isValid: true,
          details: 'CoinPayments API keys are valid and working correctly',
          service: 'coinpayments',
          response: {
            success: true,
            data: data.result
          }
        };
      } else {
        return {
          isValid: false,
          details: `API response error: ${data.error}`,
          service: 'coinpayments',
          response: {
            error: data.error
          }
        };
      }
    } catch (apiError) {
      console.error('[CoinPayments] Error testing API:', apiError);
      return {
        isValid: false,
        details: `Error testing API connection: ${apiError.message}`,
        service: 'coinpayments',
        error: apiError.message
      };
    }
    
  } catch (error) {
    console.error('[CoinPayments] Error validating keys:', error);
    return { 
      isValid: false,
      details: `Exception: ${error.message}`,
      service: 'coinpayments',
      exceptionDetails: error.stack || 'No stack trace available',
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const service = requestBody?.service || 'coinpayments';
    
    console.log(`Validating API keys for service: ${service}`);
    
    let result;
    
    if (service === 'defined.fi') {
      result = await validateDefinedFiKey();
    } else {
      result = await validateCoinPaymentsKeys();
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unhandled error in validate-api-keys:', error);
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
