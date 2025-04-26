
import { createHmac } from "https://deno.land/std@0.190.0/node/crypto.ts";

/**
 * Generate HMAC signature for CoinPayments API
 */
export function generateHmacSignature(privateKey: string, data: string): string {
  const hmac = createHmac('sha512', privateKey);
  hmac.update(data);
  return hmac.digest('hex');
}

/**
 * Encrypts a message using a key with HMAC-SHA512
 */
export function encryptHmacSha512(key: string, message: string): string {
  const hmac = createHmac('sha512', key);
  hmac.update(message);
  return hmac.digest('hex');
}

/**
 * Verify HMAC signature from IPN
 */
export function verifyHmacSignature(data: any, signature: string, ipnSecret: string): boolean {
  try {
    // Convert data to string if it's not already
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Generate HMAC signature using the IPN secret
    const calculatedSignature = encryptHmacSha512(ipnSecret, dataStr);
    
    // Compare signatures (case-insensitive)
    return signature.toLowerCase() === calculatedSignature.toLowerCase();
  } catch (error) {
    console.error('Error verifying HMAC signature:', error);
    return false;
  }
}
