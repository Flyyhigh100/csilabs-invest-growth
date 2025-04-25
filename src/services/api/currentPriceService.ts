
import { fetchUniswapTokenPrice } from './uniswapPriceService';
import { ENABLE_LOGGING } from './config';

export const fetchCurrentTokenPrice = async (forceRefresh: boolean = false): Promise<number> => {
  try {
    if (ENABLE_LOGGING) {
      console.log('Fetching current token price, force refresh:', forceRefresh);
    }
    const price = await fetchUniswapTokenPrice();
    return price;
  } catch (error) {
    console.error('Error in fetchCurrentTokenPrice:', error);
    throw error;
  }
};

