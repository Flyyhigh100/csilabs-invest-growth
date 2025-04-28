
import { fetchDexScreenerPrice } from './dexScreenerPriceService';
import { ENABLE_LOGGING } from './config';

export const fetchCurrentTokenPrice = async (forceRefresh: boolean = false): Promise<number> => {
  try {
    if (ENABLE_LOGGING) {
      console.log('Fetching current token price (DexScreener), force refresh:', forceRefresh);
    }
    return await fetchDexScreenerPrice();
  } catch (error) {
    console.error('Error in fetchCurrentTokenPrice:', error);
    throw error;
  }
};
