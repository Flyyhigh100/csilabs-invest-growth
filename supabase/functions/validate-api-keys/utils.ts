
import { corsHeaders } from "./cors.ts";

// Create a consistent response format
export function createErrorResponse(message: string, status = 400, details: any = null) {
  return new Response(
    JSON.stringify({
      success: false,
      message,
      details
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

export function createSuccessResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      ...data
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

// Generate HMAC signature for CoinPayments API
export async function generateCoinPaymentsHMAC(payload: string, privateKey: string): Promise<string> {
  try {
    // Convert private key to bytes
    const encoder = new TextEncoder();
    const keyData = encoder.encode(privateKey);
    
    // Convert payload to bytes
    const messageData = encoder.encode(payload);
    
    // Import the key for HMAC
    const key = await crypto.subtle.importKey(
      "raw", 
      keyData, 
      { name: "HMAC", hash: "SHA-512" }, 
      false, 
      ["sign"]
    );
    
    // Sign the payload
    const signature = await crypto.subtle.sign(
      "HMAC", 
      key, 
      messageData
    );
    
    // Convert the signature to hex
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Error generating HMAC signature:', error);
    throw error;
  }
}
