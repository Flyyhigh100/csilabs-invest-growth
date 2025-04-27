
import { fetchDexScreenerPrice } from './dexScreenerPriceService';
import { fetchTokenPriceHistory } from './historicalPriceService';
import { ENABLE_LOGGING } from './config';
import { 
  getCachedPrice, 
  setCachedPrice, 
  shouldRefreshPrice 
} from './utils/priceCache';

export const fetchCurrentTokenPrice = async (forceRefresh: boolean = false): Promise<number> => {
  try {
    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cached = getCachedPrice();
      if (cached && !shouldRefreshPrice()) {
        if (ENABLE_LOGGING) {
          console.log('Using cached price:', cached.price);
        }
        return cached.price;
      }
    }
    
    if (ENABLE_LOGGING) {
      console.log('Fetching current token price from DexScreener, force refresh:', forceRefresh);
    }
    
    try {
      // First try real-time price
      const price = await fetchDexScreenerPrice();
      const cached = setCachedPrice(price);
      if (cached) {
        return price;
      }
    } catch (error) {
      console.log('Real-time price fetch failed, trying historical price fallback');
    }
    
    // Fallback to latest historical price if real-time fails
    const historicalData = await fetchTokenPriceHistory();
    if (historicalData.length > 0) {
      const latestPrice = historicalData[historicalData.length - 1].price;
      console.log('Using historical price as fallback:', latestPrice);
      const cached = setCachedPrice(latestPrice);
      if (cached) {
        return latestPrice;
      }
    }
    
    throw new Error('Could not fetch price from any source');
  } catch (error) {
    console.error('Error in fetchCurrentTokenPrice:', error);
    
    // Return cached price as final fallback if available
    const cached = getCachedPrice();
    if (cached) {
      console.log('Using cached price as fallback after error');
      return cached.price;
    }
    
    throw error;
  }
};
