
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils.ts";

function createSupabaseClient() {
  return null; // We're not using Supabase client in this function anymore
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
    
    // Simple validation - just check if keys have proper length and format
    const isPublicKeyValid = publicKey && publicKey.length >= 20;
    const isPrivateKeyValid = privateKey && privateKey.length >= 20;
    
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
    
    // Return validation success based on key format check
    return {
      isValid: true,
      details: 'API keys exist and appear to be in the correct format.',
      service: 'coinpayments',
      publicKeyInfo: publicKey ? {
        length: publicKey.length,
        prefix: publicKey.substring(0, 5),
        suffix: publicKey.substring(publicKey.length - 5)
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
