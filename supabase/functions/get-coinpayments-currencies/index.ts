
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getAvailableCurrencies } from "../create-coinpayments-payment/api-client.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

// Main entry point
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders }, status: 401 }
      );
    }

    console.log('Fetching available cryptocurrencies from CoinPayments');
    
    // Get available currencies
    const currencies = await getAvailableCurrencies();
    
    // Filter to only include non-fiat currencies that are online and accepted
    const filteredCurrencies = Object.entries(currencies)
      .filter(([_, data]: [string, any]) => 
        data.is_fiat === 0 && 
        data.status === "online" && 
        data.accepted === 1)
      .reduce((acc, [code, data]) => {
        acc[code] = data;
        return acc;
      }, {} as Record<string, any>);
      
    console.log(`Returning ${Object.keys(filteredCurrencies).length} available cryptocurrencies`);
    
    return new Response(
      JSON.stringify({ 
        currencies: filteredCurrencies
      }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
