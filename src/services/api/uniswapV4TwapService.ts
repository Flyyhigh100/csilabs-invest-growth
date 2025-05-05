
import { gql, request } from 'graphql-request';
import { 
  UNISWAP_V4_POOL,
  V4_POOL_FORMAT, 
  ENABLE_LOGGING, 
  COUNTER_TOKEN_DECIMALS, 
  UNISWAP_V4_ENDPOINTS 
} from './config';
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
  poolFormat?: string;
  tokens?: string[];
  isDirectPoolId?: boolean;
}

let lastDiagnostics: DiagnosticsData | null = null;

// Edge function endpoint for proxying requests
const EDGE_FUNCTION_ENDPOINT = 'https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/internal-twap-status';

// Query for direct pool ID approach
const POOL_BY_ID_QUERY = gql`
  query ($id: ID!) {
    pool(id: $id) {
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

// Query for token pair approach
const POOL_BY_TOKENS_QUERY = gql`
  query ($tokens: [String!]) {
    pools(where: { tokens_contains: $tokens }) {
      id
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

/**
 * Determines if the provided pool identifier is a direct pool ID or a token pair format
 * @param poolIdentifier The pool ID or token pair string
 * @returns Boolean indicating if it's a direct pool ID
 */
function isDirectPoolId(poolIdentifier: string): boolean {
  // If it contains a hyphen, it's likely the token pair format
  return !poolIdentifier.includes('-');
}

/**
 * Query the V4 subgraph to get the current sqrtPriceX96 value
 * Supporting both direct pool ID and token addresses formats
 * 
 * @returns The sqrtPriceX96 value as a BigInt and the pool data
 */
export async function queryV4PoolData(): Promise<{ sqrtPriceX96: bigint, poolData: any }> {
  const poolIdentifier = UNISWAP_V4_POOL;
  const isDirectId = isDirectPoolId(poolIdentifier);
  
  // Choose query parameters based on pool identifier format
  let queryParams: any;
  let queryString: any;
  
  if (isDirectId) {
    // Direct pool ID approach
    queryParams = { id: poolIdentifier };
    queryString = POOL_BY_ID_QUERY;
    
    if (DEBUG_TWAP) {
      console.debug(`[DEBUG_TWAP] Using direct pool ID query with ID: ${poolIdentifier}`);
      lastDiagnostics = {
        ...lastDiagnostics,
        isDirectPoolId: true,
        poolId: poolIdentifier
      };
    }
  } else {
    // Token pair approach
    const tokens = poolIdentifier.split('-');
    
    if (tokens.length !== 2) {
      throw new Error(`Invalid V4 pool format: ${poolIdentifier}, expected 'tokenA-tokenB' or direct pool ID`);
    }
    
    queryParams = { tokens };
    queryString = POOL_BY_TOKENS_QUERY;
    
    if (DEBUG_TWAP) {
      console.debug(`[DEBUG_TWAP] Using token pair query with tokens: ${tokens.join(', ')}`);
      lastDiagnostics = {
        ...lastDiagnostics,
        isDirectPoolId: false,
        tokens,
        poolFormat: poolIdentifier
      };
    }
  }

  if (DEBUG_TWAP) {
    console.debug('[DEBUG_TWAP] Attempting to query V4 subgraph endpoints');
    
    // Save diagnostic data
    lastDiagnostics = {
      ...lastDiagnostics,
      requestParams: {
        ...queryParams,
        query: queryString.toString()
      }
    };
  }

  // Collect errors from all endpoint attempts for diagnostic purposes
  const errors = [];
  
  // Try each endpoint in sequence
  for (const endpoint of UNISWAP_V4_ENDPOINTS) {
    if (DEBUG_TWAP) {
      console.debug(`[DEBUG_TWAP] Trying endpoint: ${endpoint}`);
    }
    
    try {
      const startTime = performance.now();
      const response = await request<any>(endpoint, queryString, queryParams);
      const endTime = performance.now();
      
      if (ENABLE_LOGGING || DEBUG_TWAP) {
        console.debug(`subgraph-ms (${endpoint})`, endTime - startTime);
      }

      if (DEBUG_TWAP) {
        console.debug(`[DEBUG_TWAP] Raw response from ${endpoint}:`, JSON.stringify(response));
        
        // Save response for diagnostics
        lastDiagnostics = {
          ...lastDiagnostics,
          response: response,
          endpoint: endpoint
        };
      }

      let pool;
      
      // Handle response based on query type
      if (isDirectId) {
        // Direct pool ID query returns a single pool
        pool = response?.pool;
        
        if (!pool) {
          const errorMsg = `Pool with ID ${poolIdentifier} not found at ${endpoint}`;
          if (DEBUG_TWAP) {
            console.error('[DEBUG_TWAP] Error:', errorMsg);
          }
          errors.push({ endpoint, error: errorMsg });
          continue; // Try next endpoint
        }
      } else {
        // Token pair query returns an array of pools
        const pools = response?.pools;
        
        if (!pools || pools.length === 0) {
          const errorMsg = `No pools found with the specified tokens at ${endpoint}`;
          if (DEBUG_TWAP) {
            console.error('[DEBUG_TWAP] Error:', errorMsg);
          }
          errors.push({ endpoint, error: errorMsg });
          continue; // Try next endpoint
        }
        
        // Use the first pool that contains both tokens
        pool = pools[0];
      }
      
      if (!pool?.sqrtPriceX96) {
        const errorMsg = `Failed to fetch sqrtPriceX96 from subgraph at ${endpoint}`;
        if (DEBUG_TWAP) {
          console.error('[DEBUG_TWAP] Error:', errorMsg);
        }
        errors.push({ endpoint, error: errorMsg });
        continue; // Try next endpoint
      }

      // Store token details for diagnostics
      if (DEBUG_TWAP && pool.token0 && pool.token1) {
        console.debug('[DEBUG_TWAP] Pool token0:', pool.token0);
        console.debug('[DEBUG_TWAP] Pool token1:', pool.token1);
        
        lastDiagnostics = {
          ...lastDiagnostics,
          token0: pool.token0,
          token1: pool.token1,
          poolId: pool.id || poolIdentifier
        };
      }

      // Store the sqrtPriceX96 for diagnostics
      if (DEBUG_TWAP) {
        lastDiagnostics = {
          ...lastDiagnostics,
          sqrtPriceX96: pool.sqrtPriceX96
        };
      }

      console.log(`Successfully fetched data from ${endpoint}`);
      // Convert the string to BigInt and return with pool data
      return { 
        sqrtPriceX96: BigInt(pool.sqrtPriceX96),
        poolData: pool
      };
    } catch (error) {
      console.warn(`[DEBUG_TWAP] Endpoint ${endpoint} failed:`, error);
      
      errors.push({ 
        endpoint, 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      // Enhanced error logging
      if (DEBUG_TWAP) {
        console.error('[DEBUG_TWAP] Query error details:', {
          endpoint,
          isDirectId,
          poolId: isDirectId ? poolIdentifier : null,
          tokens: !isDirectId ? poolIdentifier.split('-') : null,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined
        });
        
        lastDiagnostics = {
          ...lastDiagnostics,
          error: `${endpoint} failed: ${error instanceof Error ? error.message : String(error)}`
        };
      }
      
      // Continue to try next endpoint
    }
  }
  
  // If all direct subgraph queries failed, try using the edge function as a proxy
  console.log('[DEBUG_TWAP] All direct subgraph queries failed. Attempting to fetch via edge function proxy');
  try {
    const proxyStartTime = performance.now();
    // Use the appropriate parameter based on pool identifier format
    let url = `${EDGE_FUNCTION_ENDPOINT}/test-connection?`;
    
    if (isDirectId) {
      url += `poolId=${encodeURIComponent(poolIdentifier)}`;
    } else {
      url += `tokens=${encodeURIComponent(poolIdentifier)}`;
    }
    
    const response = await fetch(url);
    
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
    
    if (!data.success) {
      throw new Error(`Edge function proxy returned error: ${data.error || 'Unknown error'}`);
    }
    
    let pool;
    
    // Extract pool data based on query type
    if (isDirectId) {
      pool = data.data?.data?.pool;
      if (!pool) {
        throw new Error('Edge function proxy returned no pool data');
      }
    } else {
      const pools = data.data?.data?.pools;
      if (!pools || pools.length === 0) {
        throw new Error('Edge function proxy returned no pools');
      }
      pool = pools[0];
    }
    
    if (!pool.sqrtPriceX96) {
      throw new Error('Edge function proxy returned no sqrtPriceX96');
    }
    
    // Set the source to edge proxy
    lastSource = 'edgeProxy';
    
    // Store token details from proxy
    if (DEBUG_TWAP && pool.token0 && pool.token1) {
      lastDiagnostics = {
        ...lastDiagnostics,
        token0: pool.token0,
        token1: pool.token1,
        sqrtPriceX96: pool.sqrtPriceX96
      };
    }
    
    return { 
      sqrtPriceX96: BigInt(pool.sqrtPriceX96),
      poolData: pool
    };
  } catch (proxyError) {
    console.error('[DEBUG_TWAP] Edge function proxy attempt failed:', proxyError);
    
    if (DEBUG_TWAP) {
      lastDiagnostics = {
        ...lastDiagnostics,
        error: `All direct queries and edge proxy failed. Errors: ${JSON.stringify(errors)}. Proxy error: ${proxyError instanceof Error ? proxyError.message : String(proxyError)}`
      };
    }
    
    // Re-throw with comprehensive error message listing all failed attempts
    throw new Error(`Failed to get pool data: All endpoints failed: ${JSON.stringify(errors)}`);
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
    const price = Number((sqrtPriceX96 * sqrtPriceX96 >> 192n)) / 10**(decimals0 - decimals1);
    
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
  lastDiagnostics = { 
    poolId: isDirectPoolId(UNISWAP_V4_POOL) ? UNISWAP_V4_POOL : null,
    poolFormat: !isDirectPoolId(UNISWAP_V4_POOL) ? UNISWAP_V4_POOL : null,
    tokens: !isDirectPoolId(UNISWAP_V4_POOL) ? UNISWAP_V4_POOL.split('-') : null,
    isDirectPoolId: isDirectPoolId(UNISWAP_V4_POOL)
  };
  
  try {
    while (retries <= MAX_RETRIES) {
      try {
        if (ENABLE_LOGGING || DEBUG_TWAP) {
          console.log(`Fetching V4 price from subgraph using ${isDirectPoolId(UNISWAP_V4_POOL) ? 'pool ID' : 'tokens'}: ${UNISWAP_V4_POOL}`);
        }
        
        // Try direct subgraph query first
        try {
          // Query the subgraph using appropriate approach
          const { sqrtPriceX96, poolData } = await queryV4PoolData();
          
          // Convert to decimal price
          const decimals0 = parseInt(poolData.token0.decimals);
          const decimals1 = parseInt(poolData.token1.decimals);
          const price = convertQ96ToDecimal(sqrtPriceX96, decimals0, decimals1);
          
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
