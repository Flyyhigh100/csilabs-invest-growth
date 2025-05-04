
/**
 * Utility function to create error responses with CORS headers
 */
export function createErrorResponse(message: string, statusCode = 400, additionalData = {}) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  return new Response(
    JSON.stringify({
      success: false,
      message,
      timestamp: new Date().toISOString(),
      ...additionalData
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

/**
 * Utility function to create success responses with CORS headers
 */
export function createSuccessResponse(data = {}) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  return new Response(
    JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      ...data
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}
