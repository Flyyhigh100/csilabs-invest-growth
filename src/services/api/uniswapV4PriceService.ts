import { UNISWAP_V4_URL, UNISWAP_V4_POOL, COUNTER_TOKEN_SYMBOL, ENABLE_LOGGING } from './config';

interface PoolData {
  token0: { id: string; symbol: string; decimals: string };
  token1: { id: string; symbol: string; decimals: string };
  sqrtPriceX96: string;
}

const POOL_QUERY = `query ($id: ID!) {
  pool(id: $id) {
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
    const response = await fetch(UNISWAP_V4_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: POOL_QUERY, variables: { id: UNISWAP_V4_POOL } })
    });
    if (!response.ok) throw new Error(`V4 HTTP ${response.status}`);

    const json = await response.json();
    const pool: PoolData | undefined = json.data?.pool;
    if (!pool) throw new Error('V4 pool not found');

    const sqrtStr = pool.sqrtPriceX96;
    const decimals0 = parseInt(pool.token0.decimals);
    const decimals1 = parseInt(pool.token1.decimals);

    const priceToken1PerToken0 = sqrtPriceToPrice(sqrtStr, decimals0, decimals1);

    let priceUSD: number;

    if (pool.token1.symbol.toUpperCase() === COUNTER_TOKEN_SYMBOL) {
      priceUSD = priceToken1PerToken0; // token0 price in USDT
    } else if (pool.token0.symbol.toUpperCase() === COUNTER_TOKEN_SYMBOL) {
      priceUSD = 1 / priceToken1PerToken0; // invert
    } else {
      throw new Error('USDT not in v4 pool');
    }

    if (isNaN(priceUSD) || priceUSD <= 0) throw new Error('Invalid v4 price');

    if (ENABLE_LOGGING) console.log('[V4] Price', priceUSD);
    return priceUSD;
  } catch (err) {
    if (ENABLE_LOGGING) console.error('[V4] error', err);
    throw err;
  }
}; 