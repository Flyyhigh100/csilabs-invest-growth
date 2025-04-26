import { UNISWAP_V3_URL, UNISWAP_V3_POOL, COUNTER_TOKEN_SYMBOL, ENABLE_LOGGING } from './config';

interface PoolData {
  token0: { id: string; symbol: string; decimals: string };
  token1: { id: string; symbol: string; decimals: string };
  token0Price: string;
  token1Price: string;
}

const POOL_QUERY = `query ($id: ID!) {
  pool(id: $id) {
    token0 { id symbol decimals }
    token1 { id symbol decimals }
    token0Price
    token1Price
  }
}`;

export const fetchUniswapV3Price = async (): Promise<number> => {
  try {
    const response = await fetch(UNISWAP_V3_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: POOL_QUERY, variables: { id: UNISWAP_V3_POOL } })
    });

    if (!response.ok) {
      throw new Error(`V3 subgraph HTTP ${response.status}`);
    }

    const json = await response.json();
    const pool: PoolData | undefined = json.data?.pool;
    if (!pool) throw new Error('Pool not found in v3 subgraph');

    let priceUSD: number | null = null;

    if (pool.token0.symbol.toUpperCase() === COUNTER_TOKEN_SYMBOL) {
      priceUSD = parseFloat(pool.token0Price);
    } else if (pool.token1.symbol.toUpperCase() === COUNTER_TOKEN_SYMBOL) {
      priceUSD = parseFloat(pool.token1Price);
    } else {
      throw new Error(`Neither side of pool is ${COUNTER_TOKEN_SYMBOL}`);
    }

    if (!priceUSD || isNaN(priceUSD) || priceUSD <= 0) {
      throw new Error('Invalid price returned from v3');
    }

    if (ENABLE_LOGGING) {
      console.log('[V3] Price fetched', priceUSD);
    }

    return priceUSD;
  } catch (err) {
    if (ENABLE_LOGGING) {
      console.error('[V3] fetch price error:', err);
    }
    throw err;
  }
}; 