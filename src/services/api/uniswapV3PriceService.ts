
import { makeGraphQLCall } from './proxyService';
import { isValidPrice } from './utils/priceValidation';
import { ENABLE_LOGGING, UNISWAP_V3_POOL } from './config';

/**
 * Fetches current token price from Uniswap V3 subgraph via proxy
 */
export const fetchUniswapV3Price = async (): Promise<number> => {
  try {
    if (ENABLE_LOGGING) {
      console.log('Fetching Uniswap V3 price via proxy');
    }
    
    const query = `
      query ($id: ID!) {
        pool(id: $id) {
          token0 { id symbol decimals }
          token1 { id symbol decimals }
          token0Price
          token1Price
        }
      }
    `;
    
    const variables = { id: UNISWAP_V3_POOL.toLowerCase() };
    
    const data = await makeGraphQLCall(query, variables);
    
    if (!data?.data?.pool) {
      throw new Error(`Pool ${UNISWAP_V3_POOL} not found in V3 subgraph`);
    }
    
    const pool = data.data.pool;
    const token0Price = parseFloat(pool.token0Price);
    const token1Price = parseFloat(pool.token1Price);
    
    // Determine which token is CSL and get its price in USDC
    const cslTokenAddress = '0xcba5ca199bca0af3f6046da01169035f2c6a7ff0';
    const token0Address = pool.token0.id.toLowerCase();
    const isCslToken0 = token0Address === cslTokenAddress.toLowerCase();
    
    // Get the price of CSL in terms of the other token
    const rawPrice = isCslToken0 ? token1Price : token0Price;
    
    if (!isValidPrice(rawPrice)) {
      throw new Error(`Invalid V3 price: ${rawPrice}`);
    }
    
    if (ENABLE_LOGGING) {
      console.log('Successfully fetched Uniswap V3 price via proxy:', rawPrice);
    }
    
    return rawPrice;
  } catch (error) {
    console.error('Error fetching Uniswap V3 price via proxy:', error);
    throw error;
  }
};
