
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, testHmacSignature } from "./utils.ts";

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
    const isPublicKeyValid = publicKey && publicKey.length >= 16;
    const isPrivateKeyValid = privateKey && privateKey.length >= 16;
    
    // Test the HMAC signature generation with the private key
    let hmacTestPassed = false;
    if (isPrivateKeyValid) {
      hmacTestPassed = await testHmacSignature(privateKey);
      console.log(`HMAC test result: ${hmacTestPassed ? 'PASSED' : 'FAILED'}`);
    }
    
    if (!isPublicKeyValid || !isPrivateKeyValid || !hmacTestPassed) {
      return {
        isValid: false,
        details: 'API keys appear to be invalid (incorrect format or length)',
        service: 'coinpayments',
        keyCheck: {
          publicKeyValid: isPublicKeyValid,
          privateKeyValid: isPrivateKeyValid,
          hmacTestPassed
        }
      };
    }
    
    // Return validation success
    return {
      isValid: true,
      details: 'API keys exist and appear to be in the correct format.',
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

async function validateStripeKeys() {
  try {
    // Check for existence of key environment variables
    const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!secretKey && !webhookSecret) {
      return { 
        isValid: false, 
        details: 'No Stripe API keys found',
        service: 'stripe',
        missing: {
          secretKey: !secretKey,
          webhookSecret: !webhookSecret
        }
      };
    }
    
    // Check key format (basic validation)
    const keyResults = {
      secretKeyValid: secretKey && secretKey.startsWith('sk_'),
      webhookSecretValid: webhookSecret && webhookSecret.startsWith('whsec_'),
    };
    
    const resultsLog = {
      secretKeyPresent: !!secretKey,
      secretKeyPrefix: secretKey ? secretKey.substring(0, 5) : null,
      secretKeyLength: secretKey ? secretKey.length : 0,
      webhookSecretPresent: !!webhookSecret,
      webhookSecretPrefix: webhookSecret ? webhookSecret.substring(0, 6) : null,
      webhookSecretLength: webhookSecret ? webhookSecret.length : 0,
    };
    
    console.log('Stripe key validation results:', resultsLog);
    
    // Determine overall validation status
    const isValid = (keyResults.secretKeyValid || !secretKey) && 
                    (keyResults.webhookSecretValid || !webhookSecret);
    
    if (!isValid) {
      return {
        isValid: false,
        details: 'One or more Stripe API keys have invalid format',
        service: 'stripe',
        keyCheck: keyResults
      };
    }
    
    // Return validation success with details
    const validKeys = [];
    const missingKeys = [];
    
    if (secretKey) validKeys.push('STRIPE_SECRET_KEY');
    else missingKeys.push('STRIPE_SECRET_KEY');
    
    if (webhookSecret) validKeys.push('STRIPE_WEBHOOK_SECRET');
    else missingKeys.push('STRIPE_WEBHOOK_SECRET');
    
    return {
      isValid: true,
      details: `Found valid Stripe ${validKeys.join(' and ')}${missingKeys.length > 0 ? ` (Missing: ${missingKeys.join(', ')})` : ''}`,
      service: 'stripe',
      validKeys,
      missingKeys,
      keyInfo: {
        secretKey: secretKey ? {
          prefix: secretKey.substring(0, 5) + '...',
          length: secretKey.length,
        } : null,
        webhookSecret: webhookSecret ? {
          prefix: webhookSecret.substring(0, 6) + '...',
          length: webhookSecret.length,
        } : null
      }
    };
    
  } catch (error) {
    console.error('Error validating Stripe keys:', error);
    return { 
      isValid: false,
      details: `Exception: ${error.message}`,
      service: 'stripe',
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
        
      case 'stripe':
        result = await validateStripeKeys();
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
