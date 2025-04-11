
// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Create a standardized error response
export function createErrorResponse(message: string, statusCode?: number) {
  return {
    error: message,
    status: 'error',
    timestamp: new Date().toISOString(),
    code: statusCode || 500
  };
}

// Create a standardized success response
export function createSuccessResponse(data: any) {
  return {
    ...data,
    status: data.status || 'success',
    timestamp: new Date().toISOString()
  };
}

// Create HMAC signature for CoinPayments API
export async function createSignature(payload: string, privateKey: string): Promise<string> {
  try {
    // Convert the payload and private key to Uint8Array
    const payloadBytes = new TextEncoder().encode(payload);
    const keyBytes = new TextEncoder().encode(privateKey);
    
    // Create HMAC key from the private key
    const key = await crypto.subtle.importKey(
      'raw', keyBytes, { name: 'HMAC', hash: 'SHA-512' },
      false, ['sign']
    );
    
    // Sign the payload
    const signature = await crypto.subtle.sign(
      'HMAC', key, payloadBytes
    );
    
    // Convert to hex string
    const signatureArray = Array.from(new Uint8Array(signature));
    return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Error creating HMAC signature:', error);
    throw new Error(`Failed to create signature: ${error.message}`);
  }
}
