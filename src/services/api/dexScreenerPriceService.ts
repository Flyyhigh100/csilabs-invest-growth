
import { isValidPrice } from './utils/priceValidation';

const PAIR = import.meta.env.VITE_PAIR_ADDRESS?.toLowerCase() ||
  '0x03f8fe849404dca3ae3e16ac4ff0b240dbc139f4';

export const fetchDexScreenerPrice = async (): Promise<number> => {
  console.log('Fetching current price from DexScreener for pair:', PAIR);
  
  const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/polygon/${PAIR}`);
  if (!res.ok) {
    console.error('DexScreener API error:', res.status);
    throw new Error('DexScreener ' + res.status);
  }
  
  const json = await res.json();
  console.log('Raw DexScreener current price response:', json);
  
  const price = Number(json.pair?.priceUsd);
  
  if (!isValidPrice(price)) {
    console.error('Invalid price received from DexScreener:', price);
    throw new Error('Invalid price received from DexScreener');
  }
  
  console.log('Validated current price:', price);
  return price;
}; 
