
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils.ts";
import { testHmacSignature } from "./utils.ts";

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
    
    // Check key format and length
    if (apiKey.length < 30) {
      return {
        isValid: false,
        details: 'API key appears to be invalid (incorrect format or length)',
        service: 'defined.fi',
      };
    }

    // Attempt a simple API request to validate key
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
    const publicKey = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
    const privateKey = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');
    const ipnSecret = Deno.env.get('COINPAYMENTS_IPN_SECRET');
    
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
    
    // Improved validation of CoinPayments API keys
    const isPublicKeyValid = publicKey.length >= 40; // CoinPayments public keys are typically long
    const isPrivateKeyValid = privateKey.length >= 40; // CoinPayments private keys are typically long
    
    // Basic format validation
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

    // Test HMAC signature generation
    const hmacValid = await testHmacSignature(privateKey);
    if (!hmacValid) {
      return {
        isValid: false,
        details: 'Private key failed HMAC signature test',
        service: 'coinpayments'
      };
    }

    // Attempt a simple API request to validate keys
    try {
      // Generate signature components
      const nonce = Math.floor(Date.now() / 1000).toString();
      const message = `version=1&key=${publicKey}&format=json&nonce=${nonce}&cmd=get_basic_info`;
      
      // Create HMAC signature
      const encoder = new TextEncoder();
      const key = encoder.encode(privateKey);
      const messageData = encoder.encode(message);
      const cryptoKey = await crypto.subtle.importKey(
        "raw", key, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]
      );
      const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
      const hmac = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      console.log('Testing CoinPayments API with simple request...');
      
      // Make a simple API request to validate keys
      const response = await fetch('https://www.coinpayments.net/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'HMAC': hmac
        },
        body: message
      });
      
      const data = await response.json();
      console.log('CoinPayments API test response:', JSON.stringify(data).substring(0, 200) + '...');
      
      if (data.error === 'ok') {
        return {
          isValid: true,
          details: 'CoinPayments API keys are valid and working correctly',
          service: 'coinpayments',
          response: {
            success: true,
            username: data.result?.username || 'Not available'
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
      console.error('Error testing CoinPayments API:', apiError);
      return {
        isValid: false,
        details: `Error testing API connection: ${apiError.message}`,
        service: 'coinpayments',
        error: apiError.message
      };
    }
    
  } catch (error) {
    console.error('Error validating CoinPayments keys:', error);
    return { 
      isValid: false,
      details: `Exception: ${error.message}`,
      service: 'coinpayments',
      exceptionDetails: error.stack || 'No stack trace available',
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the service to validate from the request body
    const requestBody = await req.json();
    const service = requestBody?.service || 'coinpayments'; // Default to CoinPayments if not specified
    
    console.log(`Validating API keys for service: ${service}`);
    
    let result;
    
    // Determine which service to validate
    if (service === 'defined.fi') {
      result = await validateDefinedFiKey();
    } else {
      // Default to CoinPayments
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
