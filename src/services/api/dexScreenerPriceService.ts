
import { UNISWAP_V4_POOL } from './config';

export const fetchDexScreenerPrice = async (): Promise<number> => {
  // Use V4 pool address as the default pair address
  const PAIR = import.meta.env.VITE_PAIR_ADDRESS?.toLowerCase() || UNISWAP_V4_POOL;
  
  console.log('Fetching current price from DexScreener for pair:', PAIR);
  
  const res = await fetch(
    `https://api.dexscreener.com/latest/dex/pairs/polygon/${PAIR}`
  );
  
  if (!res.ok) {
    throw new Error('DexScreener ' + res.status);
  }

  const json = await res.json();
  console.log('DexScreener API response:', json);
  
  const price = Number(json.pair?.priceUsd);
  if (!price) {
    throw new Error('priceUsd missing');
  }
  
  console.log('Validated current price:', price);
  return price;
};
