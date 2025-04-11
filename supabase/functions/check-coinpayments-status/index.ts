
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, createErrorResponse, logRequestDetails } from "./utils.ts";
import { processTransaction } from "./transaction-handler.ts";

serve(async (req) => {
  // Log request details for debugging
  logRequestDetails(req, 'check-coinpayments-status');

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
        JSON.stringify({
          error: 'CoinPayments API credentials not configured', 
          status: 'error',
          api_key_issue: true,
          details: 'API keys are not set in the environment variables'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Log the API key lengths (without exposing the actual keys)
    console.log(`API key lengths - public: ${publicKey.length}, private: ${privateKey.length}`);
    
    try {
      // Process the transaction
      const result = await processTransaction(transactionId, forceUpdate);
      console.log("Process result:", JSON.stringify(result));
      
      // Check if there's an error property in the result
      if (result.error) {
        // Set appropriate status code based on error type
        let statusCode = 500; // Default to server error
        
        if (result.error === 'Transaction not found' || result.error.includes('Transaction not found')) {
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
            timestamp: new Date().toISOString(),
            details: result.details || result.error
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
    } catch (processingError) {
      console.error('Error in transaction processing:', processingError);
      return new Response(
        JSON.stringify({
          error: processingError.message || 'Error processing transaction',
          details: processingError.stack || 'No stack trace available',
          status: 'error',
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        message: error.message || 'Internal server error',
        status: 'error',
        timestamp: new Date().toISOString(),
        details: error.stack ? error.stack.split('\n').slice(0, 3).join('\n') : 'No stack trace'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
