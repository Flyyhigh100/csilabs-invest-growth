
import * as crypto from "https://deno.land/std@0.190.0/crypto/mod.ts";

// CORS headers for browser access
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Create HMAC signature for CoinPayments API
export async function createSignature(data: string, key: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const dataToSign = encoder.encode(data);
    
    const hmacKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign(
      "HMAC",
      hmacKey,
      dataToSign
    );
    
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (error) {
    console.error("Error creating HMAC signature:", error);
    throw error;
  }
}

// Standard error response format
export function createErrorResponse(message: string, status = 500) {
  return {
    error: message,
    message: message,
    status: 'error',
    timestamp: new Date().toISOString()
  };
}

// Standard success response format
export function createSuccessResponse(data: Record<string, any>) {
  return {
    ...data,
    status: data.status || 'success',
    timestamp: new Date().toISOString()
  };
}
