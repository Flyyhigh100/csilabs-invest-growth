
// CORS headers for preflight requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Log request details
export function logRequestDetails(req: Request, functionName: string) {
  console.log(`${functionName}: Received ${req.method} request`);
  console.log(`Headers: ${JSON.stringify(Object.fromEntries(req.headers.entries()))}`);
}

// Create error response
export function createErrorResponse(message: string, status = 500, additionalDetails = {}) {
  return {
    error: message,
    status: 'error',
    timestamp: new Date().toISOString(),
    ...additionalDetails
  };
}

// Create success response
export function createSuccessResponse(data: Record<string, any>) {
  return {
    status: 'success',
    timestamp: new Date().toISOString(),
    ...data
  };
}

// Create HMAC signature for CoinPayments API requests using native crypto
export async function createSignature(message: string, key: string): Promise<string> {
  try {
    if (!message || !key) {
      throw new Error('Missing required parameters for HMAC signature');
    }
    
    console.log(`Creating HMAC signature with message length: ${message.length} characters`);
    
    // Convert message and key to Uint8Array
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(message);
    const keyBuffer = encoder.encode(key);
    
    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    // Sign the message
    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      messageBuffer
    );
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    console.log(`Generated signature (first 10 chars): ${hashHex.substring(0, 10)}...`);
    return hashHex;
  } catch (error) {
    console.error('Error generating HMAC signature:', error);
    throw new Error(`Failed to create signature: ${error.message}`);
  }
}
