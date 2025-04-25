
import { fetchDefinedTokenPrice } from './definedPriceService';
import { ENABLE_LOGGING } from './config';

export const fetchCurrentTokenPrice = async (forceRefresh: boolean = false): Promise<number> => {
  try {
    if (ENABLE_LOGGING) {
      console.log('Fetching current token price from Defined.fi, force refresh:', forceRefresh);
    }
    const price = await fetchDefinedTokenPrice();
    return price;
  } catch (error) {
    console.error('Error in fetchCurrentTokenPrice:', error);
    throw error;
  }
};
