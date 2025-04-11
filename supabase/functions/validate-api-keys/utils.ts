
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
