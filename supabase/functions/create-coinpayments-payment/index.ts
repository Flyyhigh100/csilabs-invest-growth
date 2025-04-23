
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "./utils.ts";
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
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Get request data
    const { amount, walletAddress, currency = 'USDT', tokenPrice } = await req.json();
    
    if (!amount || amount <= 0 || !walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount or missing wallet address' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Creating CoinPayments payment for amount: $${amount}, wallet: ${walletAddress}, currency: ${currency}`);
    console.log(`Received token price: ${tokenPrice || 'Not provided'}`);
    
    // Calculate token amount based on price if available
    const tokenAmount = tokenPrice ? amount / tokenPrice : amount;
    console.log(`Calculated token amount: ${tokenAmount}`);
    
    // Process payment request through the handler
    const paymentResponse = await handleCryptoPaymentRequest(authHeader, amount, walletAddress, currency, tokenPrice, tokenAmount);
    
    return new Response(
      JSON.stringify(paymentResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
