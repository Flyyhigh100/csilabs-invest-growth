
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function createSignature(params: Record<string, string>, privateKey: string): Promise<string> {
  const payload = new URLSearchParams(params).toString();
  console.log('Creating signature for payload:', payload);
  
  try {
    const encoder = new TextEncoder();
    const message = encoder.encode(payload);
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
    
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('').toUpperCase();
  } catch (error) {
    console.error('Error creating signature:', error);
    throw error;
  }
}
