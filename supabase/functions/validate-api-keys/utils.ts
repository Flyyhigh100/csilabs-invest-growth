
// CORS headers for preflight requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Convert string to hexadecimal string
export function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Simple HMAC test to validate private key format
export async function testHmacSignature(privateKey: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const message = encoder.encode('test_message');
    const keyBuffer = encoder.encode(privateKey.trim());
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      message
    );
    
    return signature.byteLength > 0;
  } catch (error) {
    console.error('HMAC test failed:', error);
    return false;
  }
}

// Generate HMAC signature for CoinPayments API with improved implementation
export async function generateCoinPaymentsHMAC(encodedParams: string, privateKey: string): Promise<string> {
  try {
    console.log('[CoinPayments] Generating HMAC signature for params:', encodedParams);
    
    // Trim private key to remove any whitespace
    const trimmedKey = privateKey.trim();
    
    // Convert strings to Uint8Arrays using TextEncoder
    const encoder = new TextEncoder();
    const messageData = encoder.encode(encodedParams);
    const keyData = encoder.encode(trimmedKey);
    
    // Import the key for HMAC-SHA512
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    
    // Sign the exact encoded parameter string
    const signature = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData
    );
    
    // Convert to uppercase hex string as required by CoinPayments
    const hmacHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    
    console.log('[CoinPayments] Generated HMAC signature (first 32 chars):', hmacHex.substring(0, 32) + '...');
    
    return hmacHex;
  } catch (error) {
    console.error('[CoinPayments] HMAC generation error:', error);
    throw new Error(`CoinPayments HMAC generation failed: ${error.message}`);
  }
}
