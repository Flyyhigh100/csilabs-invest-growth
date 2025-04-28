
import { fetchDexScreenerPrice } from './dexScreenerPriceService';
import { fetchDefinedPrice } from './definedPriceService';
import { fetchOnchainTwap } from './twapPriceService';
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
      console.log('Fetching current token price, force refresh:', forceRefresh);
    }
    
    // Primary source: On-chain TWAP
    try {
      const twapPrice = await fetchOnchainTwap();
      if (ENABLE_LOGGING) {
        console.log('Successfully fetched on-chain TWAP price:', twapPrice);
      }
      setCachedPrice(twapPrice);
      return twapPrice;
    } catch (twapError) {
      console.warn('Failed to fetch on-chain TWAP price, falling back to Defined.fi:', twapError);
      
      // First fallback: Defined.fi
      try {
        const definedPrice = await fetchDefinedPrice();
        setCachedPrice(definedPrice);
        return definedPrice;
      } catch (definedError) {
        console.warn('Failed to fetch from Defined.fi, falling back to DexScreener:', definedError);
        
        // Second fallback: DexScreener
        const dexScreenerPrice = await fetchDexScreenerPrice();
        setCachedPrice(dexScreenerPrice);
        return dexScreenerPrice;
      }
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
