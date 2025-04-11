
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

    // Parse request data with detailed error handling
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
    
    // Verify CoinPayments API keys are set
    const publicKey = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
    const privateKey = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');
    
    if (!publicKey || !privateKey) {
      console.error('CoinPayments API keys not configured in environment');
      return new Response(
        JSON.stringify(createErrorResponse('CoinPayments API credentials not configured')),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Process the transaction
    const result = await processTransaction(transactionId, forceUpdate);
    console.log("Process result:", JSON.stringify(result));
    
    // Check if there's an error property in the result
    if (result.error) {
      // Set appropriate status code based on error type
      let statusCode = 500; // Default to server error
      
      if (result.error === 'Transaction not found') {
        statusCode = 404;
      } else if (result.error.includes('Invalid') || result.error.includes('Missing')) {
        statusCode = 400;
      } else if (result.error.includes('API credentials') || result.error.includes('API key')) {
        statusCode = 401;
      }
      
      return new Response(
        JSON.stringify({ 
          error: result.error, 
          message: result.error,
          status: 'error',
          timestamp: new Date().toISOString()
        }),
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
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        message: error.message || 'Internal server error',
        status: 'error',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
