
// CORS headers for preflight requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a consistent response format for errors
export function createErrorResponse(message: string, status = 400, details: any = null) {
  return new Response(
    JSON.stringify({
      success: false,
      message,
      details,
      timestamp: new Date().toISOString()
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

// Create a consistent response format for successful responses
export function createSuccessResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      ...data,
      timestamp: new Date().toISOString()
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

// Validate request parameters
export function validateRequestParameters(params: any) {
  const { amount, walletAddress, currency } = params;
  const errors = [];

  if (!amount) {
    errors.push("Missing amount parameter");
  } else if (typeof amount !== 'number' || amount <= 0) {
    errors.push("Amount must be a positive number");
  }

  if (!walletAddress) {
    errors.push("Missing wallet address parameter");
  }

  if (!currency) {
    errors.push("Missing currency parameter");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
