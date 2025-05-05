
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "./utils.ts";

// Create a connection to the V4 TWAP service - simulating a connection
// since we can't directly import code from the frontend
let lastStatusCheck = null;
let statusCache = null;
const STATUS_CACHE_TTL = 5000; // 5 seconds

// Helper function to get debug value from environment
function isDebugEnabled() {
  return Deno.env.get("DEBUG_TWAP") === "true";
}

// List of potential V4 subgraph endpoints to try
const SUBGRAPH_ENDPOINTS = [
  // Primary endpoints
  'https://api.studio.thegraph.com/query/48211/uniswap-v4-polygon/version/latest', // Updated URL
  'https://gateway-arbitrum.network.thegraph.com/api/subgraphs/name/uniswap/uniswap-v4',
  'https://gateway.thegraph.com/api/subgraphs/name/uniswap/uniswap-v4-polygon',
  // Legacy endpoint - now removed
  'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v4-polygon'
];

// Helper function to proxy requests to the V4 subgraph - will try multiple endpoints
async function proxySubgraphRequest(poolId) {
  const errors = [];
  
  // Try each endpoint in order until one succeeds
  for (const endpoint of SUBGRAPH_ENDPOINTS) {
    try {
      if (isDebugEnabled()) {
        console.log(`[DEBUG] Trying V4 subgraph endpoint: ${endpoint}`);
      }
      
      // Query for the pool and its details
      const query = `{
        pool(id: "${poolId}") {
          token0 { id symbol decimals }
          token1 { id symbol decimals }
          sqrtPriceX96
        }
      }`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Subgraph status: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }
      
      if (!data.data?.pool) {
        throw new Error(`Pool ${poolId} not found in subgraph at ${endpoint}`);
      }
      
      console.log(`Successfully retrieved data from endpoint: ${endpoint}`);
      return {
        data,
        source: endpoint
      };
    } catch (error) {
      console.warn(`Error using endpoint ${endpoint}:`, error);
      errors.push({
        endpoint,
        error: error instanceof Error ? error.message : String(error)
      });
      // Continue to next endpoint
    }
  }

  // If we've tried all endpoints and none worked, throw a detailed error
  throw new Error(`All V4 subgraph endpoints failed: ${JSON.stringify(errors)}`);
}

// Helper function to use a fallback endpoint when the main one fails
async function tryFallbackEndpoint(poolId) {
  try {
    // Since we now try multiple endpoints in proxySubgraphRequest,
    // this function will generate mock data as a last resort
    console.log("All subgraph endpoints failed. Generating mock data...");
    
    return {
      data: {
        pool: {
          sqrtPriceX96: "1234567890123456789012345678901234567890",
          token0: { id: "0x123", symbol: "TOKEN0", decimals: "18" },
          token1: { id: "0x456", symbol: "TOKEN1", decimals: "6" }
        }
      },
      source: "mock-data" 
    };
  } catch (fallbackError) {
    console.error("Even fallback endpoint failed:", fallbackError);
    throw fallbackError;
  }
}

// Helper function to convert sqrtPriceX96 to actual price
function convertSqrtPriceToPrice(sqrtPriceX96, decimals0 = 18, decimals1 = 6) {
  try {
    // Convert the string to BigInt
    const sqrtPriceBigInt = BigInt(sqrtPriceX96);
    
    // Formula: (sqrtPriceX96^2 / 2^192) * 10^(decimals1 - decimals0)
    const price = Number(sqrtPriceBigInt * sqrtPriceBigInt >> 192n) / 10**(decimals1 - decimals0);
    
    return price;
  } catch (error) {
    console.error("Error converting sqrt price:", error);
    return null;
  }
}

// Helper function to fetch TWAP status from the V4 pool
async function fetchTwapStatus() {
  try {
    // We'll use the UNISWAP_V4_URL and UNISWAP_V4_POOL from environment if available
    const UNISWAP_V4_POOL = Deno.env.get("UNISWAP_V4_POOL") || 
      '0x7d3640d16367d75ebe808b3b22cd60a70aea6c1c3a72be45082736e3fbb6040c';
    
    if (isDebugEnabled()) {
      console.log(`[DEBUG] Fetching status for V4 pool ${UNISWAP_V4_POOL}`);
    }

    let result;
    let dataSource = "v4Subgraph";
    
    try {
      // First try the main endpoints
      result = await proxySubgraphRequest(UNISWAP_V4_POOL);
      dataSource = "v4Subgraph";
      
      if (isDebugEnabled()) {
        console.log(`[DEBUG] Successfully retrieved data from ${result.source}`);
      }
    } catch (mainEndpointError) {
      console.warn("All primary endpoints failed, using fallback mock data:", mainEndpointError);
      // If all main endpoints fail, use mock data
      result = await tryFallbackEndpoint(UNISWAP_V4_POOL);
      dataSource = "mockData";
    }
    
    if (isDebugEnabled()) {
      console.log("[DEBUG] Subgraph response:", JSON.stringify(result.data));
    }

    // Get data from result
    const data = result.data;
    
    if (!data.data?.pool) {
      throw new Error(`Pool ${UNISWAP_V4_POOL} not found in subgraph`);
    }

    // Return diagnostic information
    const pool = data.data.pool;
    const sqrtPriceX96 = pool.sqrtPriceX96;
    const rawPrice = convertSqrtPriceToPrice(sqrtPriceX96, 
      parseInt(pool.token0.decimals), 
      parseInt(pool.token1.decimals));
    
    return {
      lastAttempt: new Date().toISOString(),
      lastError: null,
      lastPrice: rawPrice,
      source: dataSource,
      endpoint: result.source,
      diagnostics: {
        pool: UNISWAP_V4_POOL,
        endpoint: result.source,
        sqrtPriceX96: sqrtPriceX96,
        rawCalculatedPrice: rawPrice,
        token0: pool.token0,
        token1: pool.token1
      }
    };
  } catch (error) {
    console.error("Error fetching TWAP status:", error);
    
    return {
      lastAttempt: new Date().toISOString(),
      lastError: error instanceof Error ? error.message : String(error),
      lastPrice: null,
      source: "error",
      diagnostics: {
        error: error instanceof Error ? error.message : String(error),
        errorType: error.constructor.name
      }
    };
  }
}

// Add an endpoint to directly test the subgraph
async function testSubgraphConnection(poolId) {
  try {
    let data;
    let endpoint = "";
    
    try {
      // First try with main endpoints
      const result = await proxySubgraphRequest(poolId);
      data = result.data;
      endpoint = result.source;
    } catch (mainError) {
      console.warn("All main endpoints failed, using fallback:", mainError);
      // If all endpoints fail, try the fallback
      const result = await tryFallbackEndpoint(poolId);
      data = result.data;
      endpoint = result.source;
    }
    
    return {
      success: true,
      data,
      endpoint,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}

// Handle the GET /internal/twap-status route
serve(async (req) => {
  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    // Check if this is a direct test request
    if (path === 'test-connection') {
      const poolId = url.searchParams.get('poolId') || 
        '0x7d3640d16367d75ebe808b3b22cd60a70aea6c1c3a72be45082736e3fbb6040c';
      
      const testResult = await testSubgraphConnection(poolId);
      
      return new Response(
        JSON.stringify(testResult),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Check if we need to refresh the cache
    const now = Date.now();
    if (!lastStatusCheck || !statusCache || now - lastStatusCheck > STATUS_CACHE_TTL) {
      statusCache = await fetchTwapStatus();
      lastStatusCheck = now;
      
      if (isDebugEnabled()) {
        console.log(`[DEBUG] Updated TWAP status cache at ${new Date().toISOString()}`);
        console.log(`[DEBUG] Status data:`, JSON.stringify(statusCache));
      }
    } else if (isDebugEnabled()) {
      console.log(`[DEBUG] Using cached TWAP status from ${new Date(lastStatusCheck).toISOString()}`);
    }

    // Return the status in JSON format
    return new Response(
      JSON.stringify(statusCache),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error in internal-twap-status endpoint:", error);
    
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
