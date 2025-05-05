
import { fetchDexScreenerPrice } from './dexScreenerPriceService';
import { fetchDefinedPrice } from './definedPriceService';
import { fetchOnchainTwap } from './twapPriceService';
import { fetchUniswapV4Price } from './uniswapV4PriceService';
import { getCachedPrice, setCachedPrice, shouldRefreshPrice } from './utils/priceCache';
import { ENABLE_LOGGING, FORCE_REFRESH_CACHE } from './config';

export const fetchCurrentTokenPrice = async (forceRefresh: boolean = false): Promise<number> => {
  try {
    // Check if we can use cached price
    if (!forceRefresh && !FORCE_REFRESH_CACHE) {
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
    
    // Primary source: Uniswap V4 - New primary source
    try {
      const v4Price = await fetchUniswapV4Price();
      if (ENABLE_LOGGING) {
        console.log('Successfully fetched Uniswap V4 price:', v4Price);
      }
      setCachedPrice(v4Price);
      return v4Price;
    } catch (v4Error) {
      console.warn('Failed to fetch Uniswap V4 price, falling back to On-chain TWAP:', v4Error);
      
      // First fallback: On-chain TWAP (from V3 pool)
      try {
        const twapPrice = await fetchOnchainTwap();
        if (ENABLE_LOGGING) {
          console.log('Successfully fetched on-chain TWAP price:', twapPrice);
        }
        setCachedPrice(twapPrice);
        return twapPrice;
      } catch (twapError) {
        console.warn('Failed to fetch on-chain TWAP price, falling back to Defined.fi:', twapError);
        
        // Second fallback: Defined.fi
        try {
          const definedPrice = await fetchDefinedPrice();
          setCachedPrice(definedPrice);
          return definedPrice;
        } catch (definedError) {
          console.warn('Failed to fetch from Defined.fi, falling back to DexScreener:', definedError);
          
          // Third fallback: DexScreener
          const dexScreenerPrice = await fetchDexScreenerPrice();
          setCachedPrice(dexScreenerPrice);
          return dexScreenerPrice;
        }
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
