
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { currency } = await req.json();
    
    if (!currency) {
      return new Response(
        JSON.stringify({ error: 'Currency parameter is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // For testing purposes, we'll use CoinGecko's public API
    // In production, you might want to use a more reliable API with authentication
    const currencyId = mapCurrencyToId(currency);
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${currencyId}&vs_currencies=usd`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data[currencyId] && data[currencyId].usd) {
        // Return the exchange rate
        return new Response(
          JSON.stringify({ 
            rate: data[currencyId].usd,
            currency: currency 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Fallback to mock data if we couldn't get a rate
        const mockRate = getMockExchangeRate(currency);
        return new Response(
          JSON.stringify({ 
            rate: mockRate,
            currency: currency,
            note: 'Using fallback rate due to API limitation' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error('Error fetching from Coingecko:', error);
      
      // Return mock exchange rate as fallback
      const mockRate = getMockExchangeRate(currency);
      return new Response(
        JSON.stringify({ 
          rate: mockRate,
          currency: currency,
          note: 'Using fallback rate due to API error' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Map our currency codes to CoinGecko IDs
function mapCurrencyToId(currency: string): string {
  const mapping: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'DOGE': 'dogecoin',
    'XRP': 'ripple',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'LTCT': 'litecoin' // Using regular litecoin as a proxy for testnet
  };
  
  return mapping[currency.toUpperCase()] || 'tether'; // Default to tether if not found
}

// Provide mock exchange rates as fallback
function getMockExchangeRate(currency: string): number {
  const mockRates: Record<string, number> = {
    'BTC': 66500,
    'ETH': 3200,
    'BNB': 560,
    'DOGE': 0.15,
    'XRP': 0.50,
    'LTCT': 0.01,
    'USDT': 1,
    'USDC': 1
  };
  
  return mockRates[currency.toUpperCase()] || 1;
}
