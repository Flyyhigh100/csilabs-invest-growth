
/**
 * Generate HMAC signature for CoinPayments API
 */
export async function generateHmacSignature(privateKey: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = encoder.encode(privateKey);
  const message = encoder.encode(data);
  
  // Create the HMAC key
  const cryptoKey = await crypto.subtle.importKey(
    "raw", key, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]
  );
  
  // Sign the message
  const signature = await crypto.subtle.sign(
    "HMAC", cryptoKey, message
  );
  
  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Encrypts a message using a key with HMAC-SHA512
 */
export async function encryptHmacSha512(key: string, message: string): Promise<string> {
  return await generateHmacSignature(key, message);
}

/**
 * Verify HMAC signature from IPN
 */
export async function verifyHmacSignature(data: any, signature: string, ipnSecret: string): Promise<boolean> {
  try {
    // Convert data to string if it's not already
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Generate HMAC signature using the IPN secret
    const calculatedSignature = await encryptHmacSha512(ipnSecret, dataStr);
    
    // Compare signatures (case-insensitive)
    return signature.toLowerCase() === calculatedSignature.toLowerCase();
  } catch (error) {
    console.error('Error verifying HMAC signature:', error);
    return false;
  }
}
