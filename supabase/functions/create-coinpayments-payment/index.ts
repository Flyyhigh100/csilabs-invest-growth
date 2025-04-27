
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, createErrorResponse, createSuccessResponse, validateRequestParameters } from "./utils.ts";
import { handleCryptoPaymentRequest } from "./payment-handlers.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing create-coinpayments-payment request");
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log("Missing authorization header");
      return createErrorResponse('No authorization header', 401);
    }
    
    // Get request data with better error handling
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body:", JSON.stringify(requestBody));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return createErrorResponse('Invalid JSON in request body', 400, {
        error: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      });
    }
    
    // Validate request parameters
    const { amount, walletAddress, currency = 'USDT', tokenPrice, localTransactionId } = requestBody;
    const validation = validateRequestParameters({ amount, walletAddress, currency });
    
    if (!validation.isValid) {
      console.error("Validation errors:", validation.errors);
      return createErrorResponse('Invalid request parameters', 400, {
        errors: validation.errors
      });
    }
    
    console.log(`Creating CoinPayments payment for amount: $${amount}, wallet: ${walletAddress}, currency: ${currency}`);
    console.log(`Received token price: ${tokenPrice || 'Not provided'}`);
    
    // Check if we have API keys configured
    const publicKey = Deno.env.get("COINPAYMENTS_PUBLIC_KEY");
    const privateKey = Deno.env.get("COINPAYMENTS_PRIVATE_KEY");
    
    if (!publicKey || !privateKey) {
      console.error("CoinPayments API keys not configured");
      return createErrorResponse('CoinPayments API keys not configured. Please add them in the Supabase secrets.', 500, {
        publicKeyExists: !!publicKey,
        privateKeyExists: !!privateKey
      });
    }
    
    // Enable mock mode for testing
    const useMockData = Deno.env.get("USE_MOCK_DATA") === "true";
    const allowMockFallback = Deno.env.get("ALLOW_MOCK_FALLBACK") === "true";
    
    if (useMockData) {
      console.log("MOCK MODE ENABLED: Using mock CoinPayments data");
    }
    
    if (allowMockFallback) {
      console.log("MOCK FALLBACK ENABLED: Will use mock data if API calls fail");
    }
    
    // Calculate token amount based on price if available
    const tokenAmount = tokenPrice ? amount / tokenPrice : amount;
    console.log(`Calculated token amount: ${tokenAmount}`);
    
    // Process payment request through the handler with try-catch
    try {
      const paymentResponse = await handleCryptoPaymentRequest(
        authHeader, 
        amount, 
        walletAddress, 
        currency, 
        tokenPrice, 
        tokenAmount
      );
      
      if (!paymentResponse.success) {
        console.error("Payment request failed:", paymentResponse.message);
        return createErrorResponse(paymentResponse.message || 'Failed to create payment', 400, {
          details: paymentResponse,
          debug: {
            useMockData,
            allowMockFallback,
            publicKeyExists: !!publicKey,
            privateKeyExists: !!privateKey
          }
        });
      }
      
      console.log("Payment created successfully:", paymentResponse.transactionId || paymentResponse.txn_id);
      return createSuccessResponse({
        ...paymentResponse,
        debug: {
          useMockData,
          allowMockFallback
        }
      });
    } catch (handlerError) {
      console.error("Error in payment handler:", handlerError);
      return createErrorResponse(
        `Payment handler error: ${handlerError instanceof Error ? handlerError.message : 'Unknown error'}`,
        500,
        { stack: handlerError instanceof Error ? handlerError.stack : undefined }
      );
    }
  } catch (error) {
    console.error('Unexpected error in edge function:', error);
    return createErrorResponse(error instanceof Error ? error.message : 'Internal server error', 500, {
      stack: error instanceof Error ? error.stack : undefined,
      useMockData: Deno.env.get("USE_MOCK_DATA") === "true",
      allowMockFallback: Deno.env.get("ALLOW_MOCK_FALLBACK") === "true"
    });
  }
});
