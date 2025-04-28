
import { fetchDexScreenerPrice } from './dexScreenerPriceService';
import { fetchDefinedPrice } from './definedPriceService';
import { getCachedPrice, setCachedPrice, shouldRefreshPrice } from './utils/priceCache';
import { ENABLE_LOGGING } from './config';

export const fetchCurrentTokenPrice = async (forceRefresh: boolean = false): Promise<number> => {
  try {
    // Check if we can use cached price
    if (!forceRefresh) {
      const cachedPrice = getCachedPrice();
      if (cachedPrice && !shouldRefreshPrice()) {
        if (ENABLE_LOGGING) {
          console.log('Using cached price:', cachedPrice.price);
        }
        return cachedPrice.price;
      }
    }
    
    if (ENABLE_LOGGING) {
      console.log('Fetching current token price (DexScreener), force refresh:', forceRefresh);
    }
    
    // First try fetching from Defined.fi
    try {
      const definedPrice = await fetchDefinedPrice();
      setCachedPrice(definedPrice);
      return definedPrice;
    } catch (definedError) {
      console.warn('Failed to fetch from Defined.fi, falling back to DexScreener:', definedError);
      
      // Fallback to DexScreener
      const dexScreenerPrice = await fetchDexScreenerPrice();
      setCachedPrice(dexScreenerPrice);
      return dexScreenerPrice;
    }
  } catch (error) {
    console.error('Error in fetchCurrentTokenPrice:', error);
    
    // Last resort: use cached price even if expired
    const cachedPrice = getCachedPrice();
    if (cachedPrice) {
      console.log('Using expired cached price as fallback:', cachedPrice.price);
      return cachedPrice.price;
    }
    
    throw error;
  }
};
