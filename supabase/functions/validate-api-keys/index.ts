
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "./utils.ts";

// Create a Uint8Array from a hex string (helper function for verification)
function hexToUint8Array(hexString: string): Uint8Array {
  const matches = hexString.match(/.{1,2}/g);
  if (!matches) return new Uint8Array();
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
}

// Validate CoinPayments API keys
async function validateCoinPaymentsKeys(): Promise<{
  isValid: boolean;
  details: string;
  rawResponse?: any;
  service: string;
}> {
  const publicKey = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
  const privateKey = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');
  
  if (!publicKey || !privateKey) {
    return {
      isValid: false,
      details: "API keys not configured. Please set COINPAYMENTS_PUBLIC_KEY and COINPAYMENTS_PRIVATE_KEY in your environment variables.",
      service: 'coinpayments'
    };
  }
  
  // Check key formats first
  if (!/^[0-9a-f]{16,}$/i.test(publicKey)) {
    return {
      isValid: false,
      details: "Invalid public key format. Should be a hexadecimal string.",
      service: 'coinpayments'
    };
  }
  
  if (!/^[0-9a-fA-F]+$/i.test(privateKey)) {
    return {
      isValid: false,
      details: "Invalid private key format. Should be a hexadecimal string.",
      service: 'coinpayments'
    };
  }
  
  try {
    console.log('Testing CoinPayments API with public key: ' + publicKey.substring(0, 5) + '...');
    
    // Create request parameters
    const params = {
      cmd: 'get_basic_info',
      key: publicKey,
      version: '1',
      format: 'json'
    };
    
    console.log('Request params:', JSON.stringify(params));
    
    // Create signature - this is where the issue likely is
    const paramString = new URLSearchParams(params).toString();
    console.log('Param string:', paramString);
    
    // Try both approaches for HMAC signature
    let hmacSig;
    let rawError;
    
    try {
      // Approach 1: Use the private key directly as UTF-8
      const encoder = new TextEncoder();
      const paramData = encoder.encode(paramString);
      
      console.log('Creating HMAC using private key');
      
      // Create HMAC signature using SubtleCrypto
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(privateKey),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
      );
      
      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        paramData
      );
      
      // Convert to hex string
      hmacSig = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      console.log('HMAC generated successfully, length:', hmacSig.length);
    } catch (keyError) {
      rawError = keyError;
      console.error('Error creating HMAC signature:', keyError);
      
      // Fallback to second approach
      try {
        // Approach 2: Convert the hex private key to bytes first
        const keyBytes = hexToUint8Array(privateKey);
        const encoder = new TextEncoder();
        const paramData = encoder.encode(paramString);
        
        console.log('Fallback: Creating HMAC using hex-decoded private key');
        
        const key = await crypto.subtle.importKey(
          'raw',
          keyBytes,
          { name: 'HMAC', hash: 'SHA-512' },
          false,
          ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, paramData);
        
        // Convert to hex string
        hmacSig = Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
          
        console.log('Fallback HMAC generated successfully, length:', hmacSig.length);
      } catch (fallbackError) {
        console.error('Both HMAC approaches failed:', fallbackError);
        return {
          isValid: false,
          details: `HMAC generation failed: ${keyError.message}, fallback also failed: ${fallbackError.message}`,
          service: 'coinpayments'
        };
      }
    }
    
    if (!hmacSig) {
      return {
        isValid: false,
        details: `Failed to generate HMAC signature: ${rawError?.message || 'Unknown error'}`,
        service: 'coinpayments'
      };
    }
    
    // Make the API request
    console.log('Making API request to CoinPayments');
    const response = await fetch('https://www.coinpayments.net/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmacSig,
      },
      body: new URLSearchParams(params),
    });
    
    if (!response.ok) {
      const statusText = response.statusText;
      console.error('HTTP error:', response.status, statusText);
      
      let responseText;
      try {
        responseText = await response.text();
        console.error('Response text:', responseText);
      } catch (err) {
        responseText = 'Could not read response body';
      }
      
      return {
        isValid: false,
        details: `HTTP error: ${response.status} ${statusText}. Response: ${responseText}`,
        service: 'coinpayments'
      };
    }
    
    const data = await response.json();
    console.log('API response:', JSON.stringify(data));
    
    // Check if the API returned an error
    if (data.error !== 'ok') {
      return {
        isValid: false,
        details: `API error: ${data.error}`,
        rawResponse: data,
        service: 'coinpayments'
      };
    }
    
    // Success!
    return {
      isValid: true,
      details: "API keys are valid and working properly.",
      rawResponse: {
        username: data.result?.username || 'Not available',
        merchant_id: data.result?.merchant_id || 'Not available',
        email: data.result?.email ? '[Redacted for security]' : 'Not available',
        public_name: data.result?.public_name || 'Not available',
      },
      service: 'coinpayments'
    };
  } catch (error) {
    console.error('Exception in validateCoinPaymentsKeys:', error);
    return {
      isValid: false,
      details: `Exception: ${error.message || "Unknown error"}`,
      service: 'coinpayments'
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { service } = await req.json();
    
    let result;
    if (service === 'coinpayments') {
      result = await validateCoinPaymentsKeys();
    } else {
      result = {
        isValid: false,
        details: `Unsupported service: ${service}`,
        service: service
      };
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error validating API keys:', error);
    
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        details: error.message || 'Error validating API keys',
        service: 'unknown'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
