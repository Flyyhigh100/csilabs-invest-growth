
// Common utilities for the check-coinpayments-status edge function

// CORS headers for API responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a standardized error response
export function createErrorResponse(message: string, statusCode = 500, additionalData = {}) {
  console.error(`Error [${statusCode}]: ${message}`);
  return {
    error: message,
    status: 'error',
    timestamp: new Date().toISOString(),
    statusCode,
    ...additionalData
  };
}

// Create a standardized success response
export function createSuccessResponse(data: any) {
  return {
    ...data,
    status: 'success',
    timestamp: new Date().toISOString()
  };
}

// Log structured request details
export function logRequestDetails(req: Request, functionName: string) {
  const methodColor = req.method === 'GET' ? '\x1b[32m' : req.method === 'POST' ? '\x1b[33m' : '\x1b[36m';
  console.log(`${methodColor}${functionName}: Received ${req.method} request\x1b[0m`);
  
  // Log request headers
  console.log("Headers:", JSON.stringify(Object.fromEntries(req.headers)));
  
  // Log source IP if available
  const sourceIp = req.headers.get('x-forwarded-for') || 'unknown';
  console.log(`Source IP: ${sourceIp}`);
  
  return {
    method: req.method,
    headers: Object.fromEntries(req.headers),
    sourceIp
  };
}
