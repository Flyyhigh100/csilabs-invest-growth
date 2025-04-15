
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, testHmacSignature } from "./utils.ts";

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
    
    // Enhanced validation for key format and permissions
    const isPublicKeyValid = publicKey && publicKey.length >= 16;
    const isPrivateKeyValid = privateKey && privateKey.length >= 16;
    
    // Test the HMAC signature generation with the private key
    let hmacTestPassed = false;
    let apiCallTestPassed = false;
    
    if (isPrivateKeyValid) {
      hmacTestPassed = await testHmacSignature(privateKey);
      console.log(`HMAC test result: ${hmacTestPassed ? 'PASSED' : 'FAILED'}`);
      
      // Additional test: Try a simple API call to verify key functionality
      try {
        const response = await fetch('https://www.coinpayments.net/api.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'HMAC': await testHmacSignature(privateKey)
          },
          body: new URLSearchParams({
            version: '1',
            cmd: 'get_basic_info',
            key: publicKey,
            nonce: Date.now().toString()
          })
        });
        
        apiCallTestPassed = response.ok;
        console.log(`API call test result: ${apiCallTestPassed ? 'PASSED' : 'FAILED'}`);
      } catch (apiError) {
        console.error('API call test error:', apiError);
      }
    }
    
    if (!isPublicKeyValid || !isPrivateKeyValid || !hmacTestPassed || !apiCallTestPassed) {
      return {
        isValid: false,
        details: 'API keys appear to be invalid or have limited functionality',
        service: 'coinpayments',
        keyCheck: {
          publicKeyValid: isPublicKeyValid,
          privateKeyValid: isPrivateKeyValid,
          hmacTestPassed,
          apiCallTestPassed
        }
      };
    }
    
    // Return comprehensive validation success
    return {
      isValid: true,
      details: 'API keys exist and are fully functional',
      service: 'coinpayments',
      publicKeyInfo: publicKey ? {
        length: publicKey.length,
        prefix: publicKey.substring(0, 3) + '...',
        suffix: '...' + publicKey.substring(publicKey.length - 3)
      } : null,
      ipnStatus: ipnSecret ? {
        ipnSecretConfigured: true,
        ipnSecretLength: ipnSecret.length,
      } : {
        ipnSecretConfigured: false,
        warning: 'IPN secret is not configured, which may affect webhook notifications'
      }
    };
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
