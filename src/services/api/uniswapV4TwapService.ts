
import { gql, request } from 'graphql-request';
import { UNISWAP_V4_POOL, ENABLE_LOGGING, COUNTER_TOKEN_DECIMALS } from './config';
import { isValidPrice, MIN_VALID_PRICE, MAX_VALID_PRICE } from './utils/priceValidation';
import { setCachedPrice } from './utils/priceCache';

// Constants for retry mechanisms
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Debug flag from environment
const DEBUG_TWAP = import.meta.env.VITE_DEBUG_TWAP === 'true' || import.meta.env.VITE_DEBUG_TWAP === '1';

// Status tracking for the status endpoint
let lastAttemptTime: string | null = null;
let lastError: string | null = null;
let lastPrice: number | null = null;
let lastSource: 'v4Subgraph' | 'v3Twap' | 'DexScreener' | 'cache' | 'edgeProxy' | null = null;

// Diagnostics data for debugging
interface DiagnosticsData {
  requestParams?: any;
  response?: any;
  error?: string;
  sqrtPriceX96?: string;
  calculatedPrice?: number;
  endpoint?: string;
  poolId?: string;
  token0?: any;  
  token1?: any;  
  validationLimits?: { min: number; max: number };
}

let lastDiagnostics: DiagnosticsData | null = null;

// Subgraph endpoint for Uniswap V4 on Polygon
const SUBGRAPH_ENDPOINT = import.meta.env.VITE_V4_SUBGRAPH_ENDPOINT || 
  'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v4-polygon';

// Edge function endpoint for proxying requests
const EDGE_FUNCTION_ENDPOINT = 'https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/internal-twap-status';

// Define the GraphQL response type
interface PoolQueryResponse {
  pool: {
    sqrtPriceX96: string;
  };
}

/**
 * Query the V4 subgraph to get the current sqrtPriceX96 value
 * @param poolId The Uniswap V4 pool ID
 * @returns The sqrtPriceX96 value as a BigInt
 */
export async function querySqrtPriceX96(poolId: string): Promise<bigint> {
  // Enhanced query with token details for better debugging
  const query = gql`
    {
      pool(id: "${poolId}") {
        sqrtPriceX96
        token0 {
          id
          symbol
          decimals
        }
        token1 {
          id
          symbol
          decimals
        }
      }
    }
  `;

  if (DEBUG_TWAP) {
    console.debug('[DEBUG_TWAP] Making GraphQL query to endpoint:', SUBGRAPH_ENDPOINT);
    console.debug('[DEBUG_TWAP] Pool ID:', poolId);
    console.debug('[DEBUG_TWAP] Query string:', query);
    
    // Save diagnostic data
    lastDiagnostics = {
      ...lastDiagnostics,
      requestParams: {
        endpoint: SUBGRAPH_ENDPOINT,
        poolId,
        query: query.toString()
      }
    };
  }

  let directQueryFailed = false;
  const startTime = performance.now();
  
  try {
    // First try: direct subgraph query
    const response = await request<any>(SUBGRAPH_ENDPOINT, query);
    const endTime = performance.now();
    
    if (ENABLE_LOGGING || DEBUG_TWAP) {
      console.debug('subgraph-ms', endTime - startTime);
    }

    if (DEBUG_TWAP) {
      console.debug('[DEBUG_TWAP] Raw response data:', JSON.stringify(response));
      
      // Save response for diagnostics
      lastDiagnostics = {
        ...lastDiagnostics,
        response: response
      };
    }

    if (!response?.pool?.sqrtPriceX96) {
      const errorMsg = 'Failed to fetch sqrtPriceX96 from subgraph';
      if (DEBUG_TWAP) {
        console.error('[DEBUG_TWAP] Error:', errorMsg);
        lastDiagnostics = {
          ...lastDiagnostics,
          error: errorMsg
        };
      }
      throw new Error(errorMsg);
    }

    // Store token details for diagnostics
    if (DEBUG_TWAP && response.pool.token0 && response.pool.token1) {
      console.debug('[DEBUG_TWAP] Pool token0:', response.pool.token0);
      console.debug('[DEBUG_TWAP] Pool token1:', response.pool.token1);
      
      lastDiagnostics = {
        ...lastDiagnostics,
        token0: response.pool.token0,
        token1: response.pool.token1
      };
    }

    // Store the sqrtPriceX96 for diagnostics
    if (DEBUG_TWAP) {
      lastDiagnostics = {
        ...lastDiagnostics,
        sqrtPriceX96: response.pool.sqrtPriceX96
      };
    }

    // Convert the string to BigInt
    return BigInt(response.pool.sqrtPriceX96);
  } catch (error) {
    directQueryFailed = true;
    const endTime = performance.now();
    console.warn(`[DEBUG_TWAP] Direct subgraph query failed after ${endTime - startTime}ms:`, error);
    
    // Enhanced error logging
    if (DEBUG_TWAP) {
      console.error('[DEBUG_TWAP] Query error details:', {
        endpoint: SUBGRAPH_ENDPOINT,
        poolId,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      });
      
      lastDiagnostics = {
        ...lastDiagnostics,
        error: error instanceof Error ? error.message : String(error)
      };
    }
    
    // Fall through to edge function proxy approach
  }
  
  // If direct query failed, try using the edge function as a proxy
  if (directQueryFailed) {
    console.log('[DEBUG_TWAP] Attempting to fetch via edge function proxy');
    try {
      const proxyStartTime = performance.now();
      const response = await fetch(`${EDGE_FUNCTION_ENDPOINT}/test-connection?poolId=${poolId}`);
      
      if (!response.ok) {
        throw new Error(`Edge function proxy failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const proxyEndTime = performance.now();
      
      if (DEBUG_TWAP) {
        console.debug('[DEBUG_TWAP] Edge function proxy response time:', proxyEndTime - proxyStartTime);
        console.debug('[DEBUG_TWAP] Edge proxy response:', data);
        
        lastDiagnostics = {
          ...lastDiagnostics,
          response: data,
          endpoint: EDGE_FUNCTION_ENDPOINT
        };
      }
      
      if (!data.success || !data.data?.data?.pool?.sqrtPriceX96) {
        throw new Error('Edge function proxy returned no data');
      }
      
      // Set the source to edge proxy
      lastSource = 'edgeProxy';
      
      // Store token details from proxy
      const pool = data.data.data.pool;
      if (DEBUG_TWAP && pool.token0 && pool.token1) {
        lastDiagnostics = {
          ...lastDiagnostics,
          token0: pool.token0,
          token1: pool.token1,
          sqrtPriceX96: pool.sqrtPriceX96
        };
      }
      
      return BigInt(pool.sqrtPriceX96);
    } catch (proxyError) {
      console.error('[DEBUG_TWAP] Edge function proxy attempt failed:', proxyError);
      
      if (DEBUG_TWAP) {
        lastDiagnostics = {
          ...lastDiagnostics,
          error: `Direct query and edge proxy both failed. Last error: ${proxyError instanceof Error ? proxyError.message : String(proxyError)}`
        };
      }
      
      // Re-throw the original error to maintain the original error flow
      throw new Error(`Failed to get sqrtPriceX96: Direct and proxy methods both failed`);
    }
  }
}

/**
 * Convert sqrtPriceX96 to a decimal price
 * Formula: (sqrtPriceX96^2 / 2^192) * 10^(decimals1 - decimals0)
 * 
 * @param sqrtPriceX96 The square root of the price as a Q96.96 number
 * @param decimals0 The decimals of the token0 (CSL token)
 * @param decimals1 The decimals of the token1 (USDC)
 * @returns Price as a floating point number
 */
export function convertQ96ToDecimal(
  sqrtPriceX96: bigint,
  decimals0 = 18,
  decimals1 = COUNTER_TOKEN_DECIMALS
): number {
  try {
    // Formula: (sqrtPriceX96^2 / 2^192) * 10^(decimals1 - decimals0)
    const price = Number((sqrtPriceX96 * sqrtPriceX96 >> 192n)) / 10**(decimals1 - decimals0);
    
    if (DEBUG_TWAP) {
      console.debug('[DEBUG_TWAP] Price calculation:', { 
        sqrtPriceX96: sqrtPriceX96.toString(), 
        decimals0, 
        decimals1, 
        result: price 
      });
      
      lastDiagnostics = {
        ...lastDiagnostics,
        calculatedPrice: price
      };
    }
    
    return price;
  } catch (error) {
    console.error('[DEBUG_TWAP] Error in price conversion:', error);
    
    if (DEBUG_TWAP) {
      lastDiagnostics = {
        ...lastDiagnostics,
        error: `Price conversion error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
    
    throw error;
  }
}

/**
 * Get the current status of TWAP price fetching
 * Used by the status endpoint
 */
export function getTwapStatus() {
  return {
    lastAttempt: lastAttemptTime,
    lastError: lastError,
    lastPrice: lastPrice,
    source: lastSource,
    diagnostics: lastDiagnostics,
  };
}

/**
 * Try to fetch price from the edge function directly
 * This is a fallback method when direct subgraph access fails
 */
async function fetchPriceViaEdgeFunction(): Promise<number> {
  console.log('[DEBUG_TWAP] Attempting to fetch price via edge function');
  
  try {
    const response = await fetch(EDGE_FUNCTION_ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`Edge function error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (DEBUG_TWAP) {
      console.debug('[DEBUG_TWAP] Edge function response:', data);
    }
    
    if (data.lastError) {
      throw new Error(`Edge function reports error: ${data.lastError}`);
    }
    
    if (data.lastPrice === null || typeof data.lastPrice !== 'number') {
      throw new Error('Edge function returned no valid price');
    }
    
    // Set source to edge proxy
    lastSource = 'edgeProxy';
    
    return data.lastPrice;
  } catch (error) {
    console.error('[DEBUG_TWAP] Edge function price fetch failed:', error);
    throw error;
  }
}

/**
 * Fetch price directly from the V4 subgraph and convert to decimal
 * This replaces the previous custom TWAP calculation
 */
export async function fetchSubgraphPrice(): Promise<number> {
  let retries = 0;
  lastAttemptTime = new Date().toISOString();
  lastSource = 'v4Subgraph';
  lastDiagnostics = { endpoint: SUBGRAPH_ENDPOINT, poolId: UNISWAP_V4_POOL };
  
  try {
    while (retries <= MAX_RETRIES) {
      try {
        if (ENABLE_LOGGING || DEBUG_TWAP) {
          console.log(`Fetching V4 price from subgraph for pool ${UNISWAP_V4_POOL}`);
        }
        
        // Try direct subgraph query first
        try {
          // Query the subgraph for the sqrtPriceX96
          const sqrtPriceX96 = await querySqrtPriceX96(UNISWAP_V4_POOL);
          
          // Convert to decimal price
          const price = convertQ96ToDecimal(sqrtPriceX96);
          
          if (ENABLE_LOGGING || DEBUG_TWAP) {
            console.log(`V4 subgraph price: ${price} (sqrtPriceX96: ${sqrtPriceX96.toString()})`);
          }
          
          // Debug price validation steps
          if (DEBUG_TWAP) {
            console.debug('[DEBUG_TWAP] Validating price:', price);
            console.debug('[DEBUG_TWAP] Min valid price:', MIN_VALID_PRICE);
            console.debug('[DEBUG_TWAP] Max valid price:', MAX_VALID_PRICE);
            console.debug('[DEBUG_TWAP] Price > MIN_VALID_PRICE?', price > MIN_VALID_PRICE);
            console.debug('[DEBUG_TWAP] Price < MAX_VALID_PRICE?', price < MAX_VALID_PRICE);
            
            lastDiagnostics = {
              ...lastDiagnostics,
              validationLimits: { min: MIN_VALID_PRICE, max: MAX_VALID_PRICE }
            };
          }
          
          // Validate the price
          if (!isValidPrice(price)) {
            const errorMsg = `Invalid V4 subgraph price: ${price}`;
            if (DEBUG_TWAP) {
              console.error('[DEBUG_TWAP] Validation failed:', errorMsg);
              lastDiagnostics = {
                ...lastDiagnostics,
                error: errorMsg,
                validationLimits: { min: MIN_VALID_PRICE, max: MAX_VALID_PRICE }
              };
            }
            throw new Error(errorMsg);
          }
          
          // Cache the valid price
          setCachedPrice(price);
          
          // Update status tracking
          lastPrice = price;
          lastError = null;
          
          return price;
        } catch (directQueryError) {
          console.warn('[DEBUG_TWAP] Direct query failed, trying edge function:', directQueryError);
          
          // If direct query fails, try the edge function
          const price = await fetchPriceViaEdgeFunction();
          
          // Validate the edge function price
          if (!isValidPrice(price)) {
            throw new Error(`Invalid edge function price: ${price}`);
          }
          
          // Cache the valid price
          setCachedPrice(price);
          
          // Update status tracking
          lastPrice = price;
          lastError = null;
          
          return price;
        }
      } catch (error) {
        retries++;
        
        // Update error status
        lastError = error instanceof Error ? error.message : 'Unknown error';
        
        if (retries > MAX_RETRIES) {
          console.error('V4 subgraph price fetching failed after max retries:', error);
          throw error;
        }
        
        console.warn(`V4 subgraph price fetch attempt ${retries} failed, retrying in ${RETRY_DELAY}ms:`, error);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
      }
    }

    throw new Error('V4 subgraph price fetch failed after retries');
  } catch (error) {
    // Make sure we update the error status before re-throwing
    lastError = error instanceof Error ? error.message : 'Unknown error';
    throw error;
  }
}

/**
 * Fetch TWAP price from Uniswap V4
 * This now directly uses the subgraph price instead of a custom TWAP calculation
 */
export async function fetchUniswapV4Twap(): Promise<number> {
  try {
    // Simply call the subgraph price function directly
    return await fetchSubgraphPrice();
  } catch (error) {
    console.error('Error fetching V4 subgraph price:', error);
    throw error;
  }
}
