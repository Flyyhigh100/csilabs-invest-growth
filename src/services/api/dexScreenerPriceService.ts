
import { isValidPrice } from './utils/priceValidation';
import { MAX_RETRIES, RETRY_DELAY } from './config';

const PAIR = import.meta.env.VITE_PAIR_ADDRESS?.toLowerCase() ||
  '0x03f8fe849404dca3ae3e16ac4ff0b240dbc139f4';

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying fetch... ${retries} attempts remaining`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

export const fetchDexScreenerPrice = async (): Promise<number> => {
  console.log('Fetching current price from DexScreener for pair:', PAIR);
  
  try {
    const res = await fetchWithRetry(
      `https://api.dexscreener.com/latest/dex/pairs/polygon/${PAIR}`
    );
    
    const json = await res.json();
    console.log('DexScreener API response:', json);
    
    if (!json.pairs?.[0]?.priceUsd) {
      throw new Error('Invalid price data received from DexScreener');
    }
    
    const price = Number(parseFloat(json.pairs[0].priceUsd).toFixed(8));
    
    if (!isValidPrice(price)) {
      throw new Error('Invalid price value received from DexScreener');
    }
    
    console.log('Validated current price:', price);
    return price;
  } catch (error) {
    console.error('Error fetching price from DexScreener:', error);
    throw error;
  }
};
