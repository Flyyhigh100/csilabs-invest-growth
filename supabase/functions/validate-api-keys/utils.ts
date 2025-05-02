
import { corsHeaders } from "./cors.ts";

// Generate HMAC signature for CoinPayments API
export async function generateCoinPaymentsHMAC(message: string, key: string): Promise<string> {
  // Create a TextEncoder to convert the string to bytes
  const encoder = new TextEncoder();
  
  // Convert message and key to bytes
  const messageBytes = encoder.encode(message);
  const keyBytes = encoder.encode(key);
  
  // Import key for HMAC
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  
  // Sign the message
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageBytes
  );
  
  // Convert signature to hex
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Create response helpers
export function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export function createErrorResponse(message: string, status: number = 400, details: any = {}) {
  return new Response(
    JSON.stringify({
      error: message,
      ...details
    }),
    { 
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

export { corsHeaders };
