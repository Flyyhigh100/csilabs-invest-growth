
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, generateCoinPaymentsHMAC } from "./utils.ts";

async function validateCoinPaymentsKeys(debug: boolean = false) {
  try {
    const publicKey = Deno.env.get('COINPAYMENTS_PUBLIC_KEY')?.trim();
    const privateKey = Deno.env.get('COINPAYMENTS_PRIVATE_KEY')?.trim();
    const ipnSecret = Deno.env.get('COINPAYMENTS_IPN_SECRET')?.trim();
    
    // Enhanced logging and validation
    const apiKeyInfo = {
      publicKeyLength: publicKey?.length || 0,
      privateKeyLength: privateKey?.length || 0,
      ipnSecretPresent: !!ipnSecret
    };
    
    console.log('API key validation debug info:', apiKeyInfo);
    
    if (!publicKey || !privateKey) {
      return { 
        isValid: false, 
        details: 'Missing CoinPayments API credentials',
        service: 'coinpayments',
        debugInfo: {
          publicKeyMissing: !publicKey,
          privateKeyMissing: !privateKey
        }
      };
    }
    
    // More robust key validation
    const isPublicKeyValid = publicKey.length >= 40;
    const isPrivateKeyValid = privateKey.length >= 40;
    
    if (!isPublicKeyValid || !isPrivateKeyValid) {
      return {
        isValid: false,
        details: 'CoinPayments API keys appear to be invalid',
        service: 'coinpayments',
        debugInfo: {
          publicKeyValid: isPublicKeyValid,
          privateKeyValid: isPrivateKeyValid
        }
      };
    }

    try {
      // Prepare API request parameters with proper nonce using current timestamp
      const nonce = Math.floor(Date.now() / 1000).toString();
      const params = {
        version: '1',
        cmd: 'get_basic_info',
        key: publicKey,
        format: 'json',
        nonce: nonce
      };
      
      const encodedParams = new URLSearchParams(params).toString();
      console.log('Encoded parameters:', encodedParams);
      
      // Generate HMAC signature
      const hmac = await generateCoinPaymentsHMAC(encodedParams, privateKey);
      console.log('Generated HMAC:', hmac);
      
      // Make API request
      const apiResponse = await fetch('https://www.coinpayments.net/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'HMAC': hmac
        },
        body: encodedParams
      });
      
      const responseText = await apiResponse.text();
      console.log('Raw API response:', responseText);
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse API response:', parseError);
        return {
          isValid: false,
          details: 'Invalid API response format',
          service: 'coinpayments',
          rawResponse: responseText
        };
      }
      
      if (parsedResponse && parsedResponse.error === 'ok') {
        return {
          isValid: true,
          details: 'CoinPayments API keys are valid',
          service: 'coinpayments',
          debugInfo: debug ? { 
            rawResponse: parsedResponse,
            hmac: hmac.substring(0, 32) + '...',
            encodedParams: encodedParams
          } : undefined
        };
      } else {
        return {
          isValid: false,
          details: `API response error: ${parsedResponse?.error || responseText}`,
          service: 'coinpayments',
          debugInfo: {
            rawResponse: parsedResponse,
            hmac: hmac.substring(0, 32) + '...',
            encodedParams: encodedParams,
            responseStatus: apiResponse.status
          }
        };
      }
    } catch (apiError) {
      console.error('Error testing CoinPayments API:', apiError);
      return {
        isValid: false,
        details: `API connection error: ${apiError.message}`,
        service: 'coinpayments',
        debugInfo: {
          errorMessage: apiError.message,
          errorStack: apiError.stack
        }
      };
    }
  } catch (error) {
    console.error('Unhandled error in CoinPayments key validation:', error);
    return { 
      isValid: false,
      details: `Exception: ${error.message}`,
      service: 'coinpayments',
      debugInfo: {
        errorMessage: error.message,
        errorStack: error.stack
      }
    };
  }
}

async function validateDefinedFiKey(debug: boolean = false) {
  try {
    const apiKey = Deno.env.get('DEFINED_FI_KEY')?.trim();
    
    if (!apiKey) {
      return { 
        isValid: false, 
        details: 'Missing Defined.fi API key',
        service: 'defined.fi',
        debugInfo: {
          keyMissing: true
        }
      };
    }
    
    // Basic validation for key format
    if (apiKey.length < 20) {
      return {
        isValid: false,
        details: 'Defined.fi API key appears to be invalid (too short)',
        service: 'defined.fi'
      };
    }
    
    try {
      // Make test API request to validate key
      const testResponse = await fetch('https://api.defined.fi/v1/protocols', {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      // Parse response
      const responseStatus = testResponse.status;
      const responseData = await testResponse.json().catch(() => null);
      
      if (responseStatus === 200) {
        return {
          isValid: true,
          details: 'Defined.fi API key is valid',
          service: 'defined.fi',
          debugInfo: debug ? {
            responseStatus,
            responsePreview: responseData ? JSON.stringify(responseData).substring(0, 100) : null
          } : undefined
        };
      } else if (responseStatus === 401 || responseStatus === 403) {
        return {
          isValid: false,
          details: 'Defined.fi API key is invalid or unauthorized',
          service: 'defined.fi',
          debugInfo: {
            responseStatus,
            responseData
          }
        };
      } else {
        return {
          isValid: false,
          details: `Defined.fi API returned unexpected status: ${responseStatus}`,
          service: 'defined.fi',
          debugInfo: {
            responseStatus,
            responseData
          }
        };
      }
    } catch (apiError) {
      console.error('Error testing Defined.fi API:', apiError);
      return {
        isValid: false,
        details: `API connection error: ${apiError.message}`,
        service: 'defined.fi',
        debugInfo: {
          errorMessage: apiError.message,
          errorStack: apiError.stack
        }
      };
    }
  } catch (error) {
    console.error('Unhandled error in Defined.fi key validation:', error);
    return { 
      isValid: false,
      details: `Exception: ${error.message}`,
      service: 'defined.fi',
      debugInfo: {
        errorMessage: error.message,
        errorStack: error.stack
      }
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
    const debug = requestBody?.debug || false;
    
    console.log(`Validating API keys for service: ${service}`);
    
    let result;
    
    if (service === 'defined.fi') {
      result = await validateDefinedFiKey(debug);
    } else {
      result = await validateCoinPaymentsKeys(debug);
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
