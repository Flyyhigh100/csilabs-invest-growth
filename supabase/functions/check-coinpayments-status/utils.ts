
// Helper function to create HMAC signature for CoinPayments API
export async function createSignature(data: string, secretKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(data);
  
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

// Create standardized error responses
export function createErrorResponse(message: string, statusCode = 400, additionalData = {}) {
  console.error(`Error response (${statusCode}): ${message}`);
  
  return new Response(
    JSON.stringify({
      error: message,
      ...additionalData
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

// Create standardized success responses
export function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}
