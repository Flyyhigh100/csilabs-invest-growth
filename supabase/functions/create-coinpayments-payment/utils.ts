
// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

/**
 * Create a standardized error response
 */
export function createErrorResponse(message: string, status: number = 400, details: any = null) {
  return new Response(
    JSON.stringify({
      error: message,
      success: false,
      details: details
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify({
      ...data,
      success: true
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}
