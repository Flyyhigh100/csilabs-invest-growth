
import { gql, request } from 'graphql-request';
import { UNISWAP_V4_POOL, ENABLE_LOGGING, COUNTER_TOKEN_DECIMALS } from './config';
import { isValidPrice } from './utils/priceValidation';
import { setCachedPrice } from './utils/priceCache';

// Constants for retry mechanisms
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Subgraph endpoint for Uniswap V4 on Polygon
const SUBGRAPH_ENDPOINT = import.meta.env.VITE_V4_SUBGRAPH_ENDPOINT || 
  'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v4-polygon';

/**
 * Query the V4 subgraph to get the current sqrtPriceX96 value
 * @param poolId The Uniswap V4 pool ID
 * @returns The sqrtPriceX96 value as a BigInt
 */
export async function querySqrtPriceX96(poolId: string): Promise<bigint> {
  const query = gql`
    {
      pool(id: "${poolId}") {
        sqrtPriceX96
      }
    }
  `;

  const startTime = performance.now();
  const response = await request(SUBGRAPH_ENDPOINT, query);
  const endTime = performance.now();
  
  if (ENABLE_LOGGING) {
    console.debug('subgraph-ms', endTime - startTime);
  }

  if (!response?.pool?.sqrtPriceX96) {
    throw new Error('Failed to fetch sqrtPriceX96 from subgraph');
  }

  // Convert the string to BigInt
  return BigInt(response.pool.sqrtPriceX96);
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
  // Formula: (sqrtPriceX96^2 / 2^192) * 10^(decimals1 - decimals0)
  return Number((sqrtPriceX96 * sqrtPriceX96 >> 192n)) / 10**(decimals1 - decimals0);
}

/**
 * Fetch price directly from the V4 subgraph and convert to decimal
 * This replaces the previous custom TWAP calculation
 */
export async function fetchSubgraphPrice(): Promise<number> {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      if (ENABLE_LOGGING) {
        console.log(`Fetching V4 price from subgraph for pool ${UNISWAP_V4_POOL}`);
      }
      
      // Query the subgraph for the sqrtPriceX96
      const sqrtPriceX96 = await querySqrtPriceX96(UNISWAP_V4_POOL);
      
      // Convert to decimal price
      const price = convertQ96ToDecimal(sqrtPriceX96);
      
      if (ENABLE_LOGGING) {
        console.log(`V4 subgraph price: ${price} (sqrtPriceX96: ${sqrtPriceX96.toString()})`);
      }
      
      // Validate the price
      if (!isValidPrice(price)) {
        throw new Error(`Invalid V4 subgraph price: ${price}`);
      }
      
      // Cache the valid price
      setCachedPrice(price);
      
      return price;
    } catch (error) {
      retries++;
      
      if (retries > MAX_RETRIES) {
        console.error('V4 subgraph price fetching failed after max retries:', error);
        throw error;
      }
      
      console.warn(`V4 subgraph price fetch attempt ${retries} failed, retrying in ${RETRY_DELAY}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
    }
  }

  throw new Error('V4 subgraph price fetch failed after retries');
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
