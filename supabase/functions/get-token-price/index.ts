
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Configure CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  tokenAddress?: string;
  chainId?: string;
}

// Main function to handle requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get environment variables
    const DEFINED_API_KEY = Deno.env.get('DEFINED_API_KEY');
    
    if (!DEFINED_API_KEY) {
      console.error('Missing DEFINED_API_KEY in environment variables');
      return new Response(
        JSON.stringify({ error: 'API key configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body to get token address and chain ID
    let tokenAddress: string;
    let chainId: string;
    
    try {
      const body: RequestBody = await req.json();
      tokenAddress = body.tokenAddress || '0x03f8fe849404dca3ae3e16ac4ff0b240dbc139f4'; // Default token if not specified
      chainId = body.chainId || '137'; // Default to Polygon if not specified
    } catch (e) {
      // If parsing fails, use defaults
      tokenAddress = '0x03f8fe849404dca3ae3e16ac4ff0b240dbc139f4';
      chainId = '137';
      console.log('Using default token parameters');
    }
    
    console.log(`Fetching price for token ${tokenAddress} on chain ${chainId}`);
    
    // Call Defined.fi API to fetch token price
    const response = await fetch(`https://api.defined.fi/api/v0/tokens/${chainId}/${tokenAddress}/price`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DEFINED_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    // Check if the API call was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Defined.fi API error (${response.status}): ${errorText}`);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch token price', 
          status: response.status,
          details: errorText
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse the API response
    const data = await response.json();
    console.log('Price data received:', data);
    
    // Return the price data
    return new Response(
      JSON.stringify({
        price: data.price,
        timestamp: new Date().toISOString(),
        tokenAddress,
        chainId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Error in get-token-price function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
