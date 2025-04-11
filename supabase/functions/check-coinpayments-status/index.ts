
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, createErrorResponse } from "./utils.ts";
import { processTransaction } from "./transaction-handler.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify(createErrorResponse('No authorization header')),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Parse request data
    let requestData;
    try {
      requestData = await req.json();
      console.log("Request data received:", JSON.stringify(requestData));
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      return new Response(
        JSON.stringify(createErrorResponse('Invalid JSON in request body')),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const { transactionId, forceUpdate } = requestData;
    
    if (!transactionId) {
      console.error("Missing transaction ID in request");
      return new Response(
        JSON.stringify(createErrorResponse('Transaction ID is required')),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Checking status for transaction: ${transactionId}, forceUpdate: ${forceUpdate}`);
    
    // Process the transaction
    const result = await processTransaction(transactionId, forceUpdate);
    console.log("Process result:", JSON.stringify(result));
    
    // Check if there's an error property in the result
    if (result.error) {
      const statusCode = result.error === 'Transaction not found' ? 404 : 500;
      
      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: statusCode
        }
      );
    }
    
    // Return successful response
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return new Response(
      JSON.stringify(createErrorResponse(error.message || 'Internal server error')),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
