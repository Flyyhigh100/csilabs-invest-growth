
import { makeDexScreenerCall } from './proxyService';
import { isValidPrice } from './utils/priceValidation';
import { UNISWAP_V3_POOL, ENABLE_LOGGING } from './config';

/**
 * Fetches current token price from DexScreener API via proxy
 */
export const fetchDexScreenerPrice = async (): Promise<number> => {
  try {
    if (ENABLE_LOGGING) {
      console.log('Fetching price from DexScreener via proxy');
    }
    
    const data = await makeDexScreenerCall(UNISWAP_V3_POOL);
    
    if (!data?.pair?.priceUsd) {
      throw new Error('No price data returned from DexScreener');
    }
    
    const price = parseFloat(data.pair.priceUsd);
    
    if (!isValidPrice(price)) {
      throw new Error(`Invalid DexScreener price: ${price}`);
    }
    
    if (ENABLE_LOGGING) {
      console.log('Successfully fetched price from DexScreener via proxy:', price);
    }
    
    return price;
  } catch (error) {
    console.error('Error fetching price from DexScreener via proxy:', error);
    throw error;
  }
};
