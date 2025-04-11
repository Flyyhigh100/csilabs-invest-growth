
// CORS headers for cross-origin requests
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create an HMAC signature for CoinPayments API
export async function createSignature(reqBody: string, privateKey: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(privateKey);
    const msgData = encoder.encode(reqBody);
    
    const key = await crypto.subtle.importKey(
      "raw", 
      keyData, 
      { name: "HMAC", hash: "SHA-512" }, 
      false, 
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", key, msgData);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Error creating signature:', error);
    throw new Error(`Failed to create API signature: ${error.message}`);
  }
}

// Create standardized error response
export function createErrorResponse(message: string, code = 500, additionalProps = {}) {
  return {
    error: message,
    status: 'error',
    timestamp: new Date().toISOString(),
    code,
    ...additionalProps
  };
}

// Create standardized success response
export function createSuccessResponse(data: any) {
  return {
    ...data,
    status: 'success',
    timestamp: new Date().toISOString()
  };
}

// Helper to safely parse JSON with fallback
export function safeJsonParse(text: string, fallback: any = {}) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
}

// Debug helper function to log important request info
export function logRequestDetails(req: Request, functionName: string) {
  const headers = {};
  req.headers.forEach((value, key) => {
    // Don't log sensitive headers
    if (!['authorization', 'apikey'].includes(key.toLowerCase())) {
      headers[key] = value.substring(0, 50) + (value.length > 50 ? '...' : '');
    } else {
      headers[key] = 'REDACTED';
    }
  });
  
  console.log(`[${functionName}] Request details:`, {
    method: req.method,
    url: req.url,
    headers: headers
  });
}
