
// Define CORS headers for edge function
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create HMAC signature for CoinPayments API
export async function createSignature(message: string, privateKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(privateKey);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Create a standardized error response
export function createErrorResponse(message: string, status = 500) {
  return {
    error: message,
    status: 'error',
    timestamp: new Date().toISOString()
  };
}

// Create a standardized success response
export function createSuccessResponse(data: any) {
  return {
    ...data,
    timestamp: new Date().toISOString(),
    status: data.status || 'success'
  };
}

// Helper to check if something is a valid object
export function isValidObject(obj: any): boolean {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}
