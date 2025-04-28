
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, createSignature } from "./utils.ts";

// Get available CoinPayments currencies (fully inlined)
async function getAvailableCurrencies() {
  const COINPAYMENTS_API_URL = 'https://www.coinpayments.net/api.php';
  const COINPAYMENTS_PUBLIC_KEY = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
  const COINPAYMENTS_PRIVATE_KEY = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');
  
  // Check if we have API keys configured
  if (!COINPAYMENTS_PUBLIC_KEY || !COINPAYMENTS_PRIVATE_KEY) {
    console.error("CoinPayments API keys not configured");
    throw new Error("CoinPayments API keys not configured");
  }
  
  try {
    console.log('Fetching available currencies from CoinPayments API');
    
    // Add the required nonce parameter using the current timestamp
    const nonce = Date.now().toString();

    const requestParams = {
      cmd: "rates",
      key: COINPAYMENTS_PUBLIC_KEY,
      version: '1',
      format: 'json',
      nonce: nonce,
      accepted: "1"
    };

    const hmacSig = await createSignature(requestParams, COINPAYMENTS_PRIVATE_KEY);
    
    const response = await fetch(COINPAYMENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmacSig,
      },
      body: new URLSearchParams(requestParams),
    });

    const data = await response.json();
    
    console.log(`Retrieved ${Object.keys(data.result || {}).length} currencies from CoinPayments`);
    
    if (data.error !== 'ok') {
      console.error('CoinPayments API error:', data.error);
      throw new Error(`CoinPayments API error: ${data.error}`);
    }

    // Filter to only include non-fiat, online and accepted currencies
    const filteredCurrencies = Object.entries(data.result || {})
      .filter(([_, data]: [string, any]) => 
        data.is_fiat === 0 && 
        data.status === "online" && 
        data.accepted === 1)
      .reduce((acc, [code, data]) => {
        acc[code] = data;
        return acc;
      }, {} as Record<string, any>);
    
    console.log(`Filtered to ${Object.keys(filteredCurrencies).length} available cryptocurrencies`);
    return filteredCurrencies;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    throw error;
  }
}

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

    // Get available currencies
    const currencies = await getAvailableCurrencies();
    
    console.log(`Returning ${Object.keys(currencies).length} available cryptocurrencies`);
    
    return new Response(
      JSON.stringify({ 
        currencies,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in currency fetch:', error);
    
    // Return a more detailed error response
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: error.message?.includes('not configured') ? 503 : 500 
      }
    );
  }
});
