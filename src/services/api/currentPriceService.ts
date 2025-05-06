
import { fetchDexScreenerPrice } from './dexScreenerPriceService';
import { fetchDefinedPrice } from './definedPriceService';
import { fetchOnchainTwap } from './twapPriceService';
import { fetchUniswapV3Price } from './uniswapV3PriceService';
import { getCachedPrice, setCachedPrice, shouldRefreshPrice } from './utils/priceCache';
import { ENABLE_LOGGING, FORCE_REFRESH_CACHE } from './config';

// Define the return type with source information
export interface PriceResult {
  price: number;
  source: 'on-chain-v3' | 'defined.fi' | 'dexscreener' | 'cache';
}

export const fetchCurrentTokenPrice = async (forceRefresh: boolean = false): Promise<PriceResult> => {
  try {
    // Check if we can use cached price
    if (!forceRefresh && !FORCE_REFRESH_CACHE) {
      const cachedPrice = getCachedPrice();
      if (cachedPrice && !shouldRefreshPrice()) {
        if (ENABLE_LOGGING) {
          console.log('Using cached price:', cachedPrice.price);
        }
        return { 
          price: cachedPrice.price,
          source: 'cache'
        };
      }
    }
    
    if (ENABLE_LOGGING) {
      console.log('Fetching current token price, force refresh:', forceRefresh);
    }
    
    // Primary source: On-chain V3 TWAP
    try {
      const twapPrice = await fetchOnchainTwap();
      if (ENABLE_LOGGING) {
        console.log('Successfully fetched on-chain V3 TWAP price:', twapPrice);
      }
      setCachedPrice(twapPrice);
      return {
        price: twapPrice,
        source: 'on-chain-v3'
      };
    } catch (twapError) {
      console.warn('Failed to fetch on-chain V3 TWAP price, falling back to V3 spot price:', twapError);
      
      // First fallback: Uniswap V3 spot price
      try {
        const v3SpotPrice = await fetchUniswapV3Price();
        if (ENABLE_LOGGING) {
          console.log('Successfully fetched Uniswap V3 spot price:', v3SpotPrice);
        }
        setCachedPrice(v3SpotPrice);
        return {
          price: v3SpotPrice,
          source: 'on-chain-v3'
        };
      } catch (v3SpotError) {
        console.warn('Failed to fetch V3 spot price, falling back to Defined.fi:', v3SpotError);
        
        // Second fallback: Defined.fi
        try {
          const definedPrice = await fetchDefinedPrice();
          setCachedPrice(definedPrice);
          return {
            price: definedPrice,
            source: 'defined.fi'
          };
        } catch (definedError) {
          console.warn('Failed to fetch from Defined.fi, falling back to DexScreener:', definedError);
          
          // Third fallback: DexScreener
          const dexScreenerPrice = await fetchDexScreenerPrice();
          setCachedPrice(dexScreenerPrice);
          return {
            price: dexScreenerPrice,
            source: 'dexscreener'
          };
        }
      }
    }
  } catch (error) {
    console.error('Error in fetchCurrentTokenPrice:', error);
    
    // Last resort: use cached price even if expired
    const cachedPrice = getCachedPrice();
    if (cachedPrice) {
      console.log('Using expired cached price as fallback:', cachedPrice.price);
      return {
        price: cachedPrice.price,
        source: 'cache'
      };
    }
    
    throw error;
  }
};
