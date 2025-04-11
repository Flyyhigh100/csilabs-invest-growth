
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../check-coinpayments-status/utils.ts";

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
    // Test if we can create a valid HMAC with the private key
    // Try to import the key first to validate it
    try {
      const keyBytes = hexToUint8Array(privateKey);
      await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
      );
    } catch (keyError) {
      return {
        isValid: false,
        details: `Invalid private key: ${keyError.message}. The key could not be used for HMAC-SHA512 signing.`,
        service: 'coinpayments'
      };
    }
    
    // Try to make a simple API call to validate the keys work
    const params = {
      cmd: 'get_basic_info',
      key: publicKey,
      version: '1',
      format: 'json'
    };
    
    // Create signature
    const paramString = new URLSearchParams(params).toString();
    const keyBytes = hexToUint8Array(privateKey);
    const encoder = new TextEncoder();
    const paramData = encoder.encode(paramString);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, paramData);
    const hmacSig = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Make the API request
    const response = await fetch('https://www.coinpayments.net/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmacSig,
      },
      body: new URLSearchParams(params),
    });
    
    if (!response.ok) {
      return {
        isValid: false,
        details: `HTTP error: ${response.status} ${response.statusText}`,
        service: 'coinpayments'
      };
    }
    
    const data = await response.json();
    
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
