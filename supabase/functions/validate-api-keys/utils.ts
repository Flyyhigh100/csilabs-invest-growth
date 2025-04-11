
// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create HMAC signature for CoinPayments API
export async function createSignature(params: Record<string, string>, privateKey: string): Promise<string> {
  const paramString = new URLSearchParams(params).toString();
  console.log('Creating signature for payload:', paramString);
  
  try {
    // Method 1: Try using the private key directly as UTF-8
    const encoder = new TextEncoder();
    const message = encoder.encode(paramString);
    
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(privateKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      message
    );
    
    // Convert to hex string
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Error in first signature attempt:', error);
    
    // Method 2: If the first method fails, try converting hex to bytes first
    try {
      // Convert hex key to bytes if it's in hex format
      const keyBytes = privateKey.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
      const keyBuffer = new Uint8Array(keyBytes);
      
      const encoder = new TextEncoder();
      const message = encoder.encode(paramString);
      
      // Create HMAC using SubtleCrypto API with the byte array
      const key = await crypto.subtle.importKey(
        "raw",
        keyBuffer,
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
      );
      
      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        message
      );
      
      // Convert to hex string
      return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (fallbackError) {
      throw new Error(`Both signature methods failed. Original: ${error.message}, Fallback: ${fallbackError.message}`);
    }
  }
}

// Helper function to convert hex string to Uint8Array
export function hexToUint8Array(hexString: string): Uint8Array {
  const matches = hexString.match(/.{1,2}/g);
  if (!matches) return new Uint8Array();
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
}
