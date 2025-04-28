
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, createSignature, createErrorResponse, createSuccessResponse } from "./utils.ts";

// Default fallback currencies in case of API failure
const FALLBACK_CURRENCIES = {
  'USDT': { name: 'Tether (USDT)', is_fiat: 0, rate_btc: '0.000039', status: 'online', accepted: 1 },
  'BTC': { name: 'Bitcoin (BTC)', is_fiat: 0, rate_btc: '1.000000', status: 'online', accepted: 1 },
  'ETH': { name: 'Ethereum (ETH)', is_fiat: 0, rate_btc: '0.053077', status: 'online', accepted: 1 },
  'USDC': { name: 'USD Coin (USDC)', is_fiat: 0, rate_btc: '0.000040', status: 'online', accepted: 1 }
};

// Get available CoinPayments currencies with retry logic
async function getAvailableCurrencies(retryCount = 1): Promise<Record<string, any>> {
  const COINPAYMENTS_API_URL = 'https://www.coinpayments.net/api.php';
  const COINPAYMENTS_PUBLIC_KEY = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
  const COINPAYMENTS_PRIVATE_KEY = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');
  
  // Check if we have API keys configured
  if (!COINPAYMENTS_PUBLIC_KEY || !COINPAYMENTS_PRIVATE_KEY) {
    console.error("CoinPayments API keys not configured");
    throw new Error("CoinPayments API keys not configured");
  }
  
  try {
    console.log('Fetching available currencies from CoinPayments API (attempt ' + retryCount + ')');
    
    // Generate a unique nonce with higher precision and a random suffix
    // This is critical for CoinPayments API which is very strict about nonce uniqueness
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const nonce = `${timestamp}${randomSuffix}`;
    console.log('Using high-precision nonce:', nonce);

    const requestParams = {
      cmd: "rates",
      key: COINPAYMENTS_PUBLIC_KEY,
      version: '1',
      format: 'json',
      nonce: nonce,
      accepted: "1"
    };

    const hmacSig = await createSignature(requestParams, COINPAYMENTS_PRIVATE_KEY);
    console.log('Generated HMAC signature:', hmacSig.substring(0, 20) + '...');
    
    const response = await fetch(COINPAYMENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmacSig,
      },
      body: new URLSearchParams(requestParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CoinPayments API HTTP error:', response.status, errorText);
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`Retrieved ${Object.keys(data.result || {}).length} currencies from CoinPayments`);
    
    if (data.error !== 'ok') {
      console.error('CoinPayments API error:', data.error);
      
      // Handle specific error types for better debugging
      if (data.error.includes('nonce')) {
        console.error('Nonce error detected, this is an authentication issue');
        if (retryCount <= 3) {
          console.log(`Retrying with new nonce (attempt ${retryCount + 1})`);
          // Delay before retry to ensure nonce uniqueness
          await new Promise(resolve => setTimeout(resolve, 1000));
          return getAvailableCurrencies(retryCount + 1);
        }
      }
      
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
    
    // If no currencies are available, revert to fallback
    if (Object.keys(filteredCurrencies).length === 0) {
      console.warn('No currencies available from API, using fallback currencies');
      return FALLBACK_CURRENCIES;
    }
    
    return filteredCurrencies;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    
    // After all retries are exhausted, use fallback currencies
    if (retryCount >= 3) {
      console.warn('Maximum retry attempts reached, using fallback currencies');
      return FALLBACK_CURRENCIES;
    }
    
    // If we haven't reached max retries, try again
    if (retryCount < 3) {
      console.log(`Retrying fetch (attempt ${retryCount + 1})`);
      // Add increasing delay between retries
      await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
      return getAvailableCurrencies(retryCount + 1);
    }
    
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
      return createErrorResponse('No authorization header', 401);
    }

    console.log('Starting currency fetch with retry mechanism');
    
    try {
      // Get available currencies with retry logic
      const currencies = await getAvailableCurrencies();
      
      console.log(`Returning ${Object.keys(currencies).length} available cryptocurrencies`);
      
      return createSuccessResponse({ 
        currencies,
        status: 'success'
      });
    } catch (currencyError) {
      console.error('All attempts to fetch currencies failed:', currencyError);
      
      // Return fallback currencies even after error
      console.warn('Returning fallback currencies after all retry attempts failed');
      
      return createSuccessResponse({ 
        currencies: FALLBACK_CURRENCIES,
        status: 'fallback',
        error: currencyError.message
      });
    }
  } catch (error) {
    console.error('Error in currency fetch:', error);
    
    // Return a more detailed error response with fallback currencies
    return createErrorResponse(
      error.message || 'Internal server error', 
      error.message?.includes('not configured') ? 503 : 500,
      {
        fallbackCurrencies: FALLBACK_CURRENCIES,
        timestamp: new Date().toISOString()
      }
    );
  }
});
