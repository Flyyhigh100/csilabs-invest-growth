
// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create HMAC signature for CoinPayments API
export async function createSignature(params: Record<string, string>, privateKey: string): Promise<string> {
  const paramString = new URLSearchParams(params).toString();
  
  // Convert the private key from hex
  const keyData = privateKey.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || [];
  const keyBytes = new Uint8Array(keyData);
  
  // Encode the params as UTF-8
  const encoder = new TextEncoder();
  const paramData = encoder.encode(paramString);
  
  // Create the HMAC signature using SHA512
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, paramData);
  
  // Convert the signature to hex
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
