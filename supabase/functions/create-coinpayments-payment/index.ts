
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, createErrorResponse, createSuccessResponse } from "./utils.ts";
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
    
    // Get request data
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body:", JSON.stringify(requestBody));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return createErrorResponse('Invalid JSON in request body');
    }
    
    const { amount, walletAddress, currency = 'USDT', tokenPrice } = requestBody;
    
    if (!amount || amount <= 0) {
      return createErrorResponse('Invalid amount');
    }

    if (!walletAddress) {
      return createErrorResponse('Missing wallet address');
    }

    console.log(`Creating CoinPayments payment for amount: $${amount}, wallet: ${walletAddress}, currency: ${currency}`);
    console.log(`Received token price: ${tokenPrice || 'Not provided'}`);
    
    // Enable mock mode for testing
    const useMockData = Deno.env.get("USE_MOCK_DATA") === "true";
    if (useMockData) {
      console.log("MOCK MODE ENABLED: Using mock CoinPayments data");
    }
    
    // Calculate token amount based on price if available
    const tokenAmount = tokenPrice ? amount / tokenPrice : amount;
    console.log(`Calculated token amount: ${tokenAmount}`);
    
    // Process payment request through the handler
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
      return createErrorResponse(paymentResponse.message || 'Failed to create payment', 400, paymentResponse);
    }
    
    console.log("Payment created successfully:", paymentResponse.transactionId);
    return createSuccessResponse(paymentResponse);
  } catch (error) {
    console.error('Unexpected error in edge function:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
});
