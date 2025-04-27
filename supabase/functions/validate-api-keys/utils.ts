
// CORS headers for preflight requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple HMAC test to validate private key format
export async function testHmacSignature(privateKey: string): Promise<boolean> {
  try {
    // Create a test encoder
    const encoder = new TextEncoder();
    const message = encoder.encode('test_message');
    const keyBuffer = encoder.encode(privateKey);
    
    // Try to import the key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    // Try to sign something with it
    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      message
    );
    
    // If we get here, the key format is valid
    return signature.byteLength > 0;
  } catch (error) {
    console.error('HMAC test failed:', error);
    return false;
  }
}

// Convert string to hexadecimal string
export function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// More reliable HMAC generation specifically for CoinPayments
export async function generateHmacSignature(message: string, privateKey: string): Promise<string> {
  try {
    console.log(`Generating HMAC signature for message with length: ${message.length}`);
    console.log(`Message content: ${message}`);
    
    // Use TextEncoder to convert strings to Uint8Arrays
    const encoder = new TextEncoder();
    const messageData = encoder.encode(message);
    const keyData = encoder.encode(privateKey);
    
    // Import the key for HMAC
    const cryptoKey = await crypto.subtle.importKey(
      "raw", 
      keyData, 
      { name: "HMAC", hash: "SHA-512" }, 
      false, 
      ["sign"]
    );
    
    // Sign the message
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    
    // Convert to hex string
    const hmacHex = toHex(signature);
    console.log(`Generated signature (first 20 chars): ${hmacHex.substring(0, 20)}...`);
    
    return hmacHex;
  } catch (error) {
    console.error('Error generating HMAC signature:', error);
    throw new Error(`HMAC generation failed: ${error.message}`);
  }
}

// CoinPayments specific implementation following their API requirements exactly
export async function generateCoinPaymentsHMAC(message: string, privateKey: string): Promise<string> {
  try {
    console.log(`[CoinPayments] Generating HMAC for message: ${message}`);
    
    // CoinPayments requires a specific HMAC generation process
    const encoder = new TextEncoder();
    const messageData = encoder.encode(message);
    const keyData = encoder.encode(privateKey);
    
    // Import the key for HMAC with SHA-512
    const cryptoKey = await crypto.subtle.importKey(
      "raw", 
      keyData, 
      { name: "HMAC", hash: "SHA-512" }, 
      false, 
      ["sign"]
    );
    
    // Sign the message
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    
    // Convert to uppercase hex string as required by CoinPayments
    const hmacHex = toHex(signature).toUpperCase();
    console.log(`[CoinPayments] Generated HMAC signature (first 20 chars): ${hmacHex.substring(0, 20)}...`);
    
    return hmacHex;
  } catch (error) {
    console.error('[CoinPayments] HMAC generation error:', error);
    throw new Error(`CoinPayments HMAC generation failed: ${error.message}`);
  }
}
