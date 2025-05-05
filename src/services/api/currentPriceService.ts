
import { fetchDexScreenerPrice } from './dexScreenerPriceService';
import { fetchDefinedPrice } from './definedPriceService';
import { fetchOnchainTwap } from './twapPriceService';
import { fetchUniswapV4Twap } from './uniswapV4TwapService';
import { fetchUniswapV4Price } from './uniswapV4PriceService';
import { getCachedPrice, setCachedPrice, shouldRefreshPrice } from './utils/priceCache';
import { ENABLE_LOGGING, FORCE_REFRESH_CACHE } from './config';

// Initialize the V4 TWAP data collection system
import { initializeV4TwapDataCollection } from './uniswapV4TwapService';

// Start collecting price data for TWAP calculation
// Only call this if it's a browser environment (not SSR)
if (typeof window !== 'undefined') {
  // Small delay to ensure all services are loaded
  setTimeout(() => {
    initializeV4TwapDataCollection();
  }, 1000);
}

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
    
    // Primary source: Uniswap V4 TWAP
    try {
      const v4TwapPrice = await fetchUniswapV4Twap();
      if (ENABLE_LOGGING) {
        console.log('Successfully fetched Uniswap V4 TWAP price:', v4TwapPrice);
      }
      setCachedPrice(v4TwapPrice);
      return v4TwapPrice;
    } catch (v4TwapError) {
      console.warn('Failed to fetch Uniswap V4 TWAP price, falling back to V4 spot price:', v4TwapError);
      
      // First fallback: Uniswap V4 spot price
      try {
        const v4SpotPrice = await fetchUniswapV4Price();
        if (ENABLE_LOGGING) {
          console.log('Successfully fetched Uniswap V4 spot price:', v4SpotPrice);
        }
        setCachedPrice(v4SpotPrice);
        return v4SpotPrice;
      } catch (v4SpotError) {
        console.warn('Failed to fetch Uniswap V4 spot price, falling back to V3 TWAP:', v4SpotError);
        
        // Second fallback: On-chain V3 TWAP
        try {
          const twapPrice = await fetchOnchainTwap();
          if (ENABLE_LOGGING) {
            console.log('Successfully fetched on-chain V3 TWAP price:', twapPrice);
          }
          setCachedPrice(twapPrice);
          return twapPrice;
        } catch (twapError) {
          console.warn('Failed to fetch on-chain V3 TWAP price, falling back to Defined.fi:', twapError);
          
          // Third fallback: Defined.fi
          try {
            const definedPrice = await fetchDefinedPrice();
            setCachedPrice(definedPrice);
            return definedPrice;
          } catch (definedError) {
            console.warn('Failed to fetch from Defined.fi, falling back to DexScreener:', definedError);
            
            // Fourth fallback: DexScreener
            const dexScreenerPrice = await fetchDexScreenerPrice();
            setCachedPrice(dexScreenerPrice);
            return dexScreenerPrice;
          }
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
