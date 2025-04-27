
import { fetchDexScreenerPrice } from './dexScreenerPriceService';
import { fetchDefinedPrice } from './definedPriceService';
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
      console.log('Fetching current token price from Defined.fi, force refresh:', forceRefresh);
    }
    
    // First try Defined.fi API
    try {
      const price = await fetchDefinedPrice();
      
      // Attempt to cache the new price
      const cached = setCachedPrice(price);
      if (!cached && ENABLE_LOGGING) {
        console.warn('Price was fetched but not cached due to validation failure');
      }
      
      return price;
    } catch (definedError) {
      console.error('Error fetching from Defined.fi, falling back to DexScreener:', definedError);
      
      // Fall back to DexScreener if Defined.fi fails
      const price = await fetchDexScreenerPrice();
      
      // Attempt to cache the new price
      const cached = setCachedPrice(price);
      if (!cached && ENABLE_LOGGING) {
        console.warn('Price was fetched but not cached due to validation failure');
      }
      
      return price;
    }
  } catch (error) {
    console.error('Error in fetchCurrentTokenPrice:', error);
    
    // Return cached price as fallback if available
    const cached = getCachedPrice();
    if (cached) {
      console.log('Using cached price as fallback after error');
      return cached.price;
    }
    
    throw error;
  }
};
