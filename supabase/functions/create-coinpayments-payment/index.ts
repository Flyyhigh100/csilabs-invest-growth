
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, createErrorResponse, createSuccessResponse } from "./utils.ts";
import { handleCryptoPaymentRequest } from "./payment-handlers.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Add authorization header verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createErrorResponse('No authorization header', 401);
    }
    
    // Get request data
    let requestBody;
    try {
      requestBody = await req.json();
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
      return createErrorResponse(paymentResponse.message || 'Failed to create payment');
    }
    
    return createSuccessResponse(paymentResponse);
  } catch (error) {
    console.error('Unexpected error in edge function:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
});
