
import { 
  UNISWAP_V4_URL, 
  V4_POOL_FORMAT, 
  COUNTER_TOKEN_SYMBOL, 
  ENABLE_LOGGING 
} from './config';

interface PoolData {
  token0: { id: string; symbol: string; decimals: string };
  token1: { id: string; symbol: string; decimals: string };
  sqrtPriceX96: string;
}

// Modified query to accommodate V4's different pool ID format
// V4 pools are identified by tokenA-tokenB (sorted by address)
const POOL_QUERY = `query ($tokens: String!) {
  pools(where: { tokens_contains: $tokens }) {
    id
    token0 { id symbol decimals }
    token1 { id symbol decimals }
    sqrtPriceX96
  }
}`;

// Helper: approximate conversion sqrtPriceX96 to price token1/token0
const sqrtPriceToPrice = (sqrtPriceX96: string, decimals0: number, decimals1: number): number => {
  const sqrtBig = BigInt(sqrtPriceX96);
  const ratio = Number(sqrtBig) / 2 ** 96;
  const price = ratio * ratio;
  return price * 10 ** (decimals0 - decimals1);
};

export const fetchUniswapV4Price = async (): Promise<number> => {
  try {
    if (ENABLE_LOGGING) {
      console.log(`[V4] Fetching price from Uniswap V4 using tokens: ${V4_POOL_FORMAT}`);
    }
    
    // Extract token addresses from the format
    const [tokenA, tokenB] = V4_POOL_FORMAT.split('-');
    
    if (!tokenA || !tokenB) {
      throw new Error(`Invalid V4 pool format: ${V4_POOL_FORMAT}, expected format is 'tokenA-tokenB'`);
    }
    
    const response = await fetch(UNISWAP_V4_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: POOL_QUERY,
        variables: { tokens: [tokenA, tokenB] }
      })
    });
    if (!response.ok) throw new Error(`V4 HTTP ${response.status}`);

    const json = await response.json();
    
    // In V4, we might get multiple pools, so we need to find the right one
    const pools = json.data?.pools;
    if (!pools || pools.length === 0) throw new Error('No V4 pools found for the specified tokens');
    
    if (ENABLE_LOGGING) {
      console.log('[V4] Found pools:', pools.length);
    }
    
    // Use the first pool for now (most likely the one we want)
    const pool: PoolData = pools[0];
    if (!pool) throw new Error('V4 pool not found');

    if (ENABLE_LOGGING) {
      console.log('[V4] Pool data:', pool);
    }

    const sqrtStr = pool.sqrtPriceX96;
    const decimals0 = parseInt(pool.token0.decimals);
    const decimals1 = parseInt(pool.token1.decimals);

    const priceToken1PerToken0 = sqrtPriceToPrice(sqrtStr, decimals0, decimals1);

    let priceUSD: number;

    if (pool.token1.symbol.toUpperCase() === COUNTER_TOKEN_SYMBOL) {
      priceUSD = priceToken1PerToken0; // token0 price in USDC
    } else if (pool.token0.symbol.toUpperCase() === COUNTER_TOKEN_SYMBOL) {
      priceUSD = 1 / priceToken1PerToken0; // invert
    } else {
      throw new Error(`${COUNTER_TOKEN_SYMBOL} not in v4 pool`);
    }

    if (isNaN(priceUSD) || priceUSD <= 0) throw new Error('Invalid v4 price');

    if (ENABLE_LOGGING) console.log('[V4] Price', priceUSD);
    return priceUSD;
  } catch (err) {
    if (ENABLE_LOGGING) console.error('[V4] error', err);
    throw err;
  }
}; 
