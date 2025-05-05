
import { fetchDexScreenerPrice } from './dexScreenerPriceService';
import { fetchDefinedPrice } from './definedPriceService';
import { fetchOnchainTwap } from './twapPriceService';
import { fetchUniswapV4Twap } from './uniswapV4TwapService';
import { fetchUniswapV4Price } from './uniswapV4PriceService';
import { getCachedPrice, setCachedPrice, shouldRefreshPrice } from './utils/priceCache';
import { ENABLE_LOGGING, FORCE_REFRESH_CACHE } from './config';

// Define the return type with source information
export interface PriceResult {
  price: number;
  source: 'on-chain' | 'on-chain-v4' | 'on-chain-v3' | 'defined.fi' | 'dexscreener' | 'cache';
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
    
    // Primary source: Uniswap V4 subgraph price
    try {
      const v4SubgraphPrice = await fetchUniswapV4Twap();
      if (ENABLE_LOGGING) {
        console.log('Successfully fetched Uniswap V4 subgraph price:', v4SubgraphPrice);
      }
      setCachedPrice(v4SubgraphPrice);
      return {
        price: v4SubgraphPrice,
        source: 'on-chain'
      };
    } catch (v4SubgraphError) {
      console.warn('Failed to fetch Uniswap V4 subgraph price, falling back to V4 spot price:', v4SubgraphError);
      
      // First fallback: Uniswap V4 spot price
      try {
        const v4SpotPrice = await fetchUniswapV4Price();
        if (ENABLE_LOGGING) {
          console.log('Successfully fetched Uniswap V4 spot price:', v4SpotPrice);
        }
        setCachedPrice(v4SpotPrice);
        return {
          price: v4SpotPrice,
          source: 'on-chain-v4'
        };
      } catch (v4SpotError) {
        console.warn('Failed to fetch Uniswap V4 spot price, falling back to V3 TWAP:', v4SpotError);
        
        // Second fallback: On-chain V3 TWAP
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
          console.warn('Failed to fetch on-chain V3 TWAP price, falling back to Defined.fi:', twapError);
          
          // Third fallback: Defined.fi
          try {
            const definedPrice = await fetchDefinedPrice();
            setCachedPrice(definedPrice);
            return {
              price: definedPrice,
              source: 'defined.fi'
            };
          } catch (definedError) {
            console.warn('Failed to fetch from Defined.fi, falling back to DexScreener:', definedError);
            
            // Fourth fallback: DexScreener
            const dexScreenerPrice = await fetchDexScreenerPrice();
            setCachedPrice(dexScreenerPrice);
            return {
              price: dexScreenerPrice,
              source: 'dexscreener'
            };
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
      return {
        price: cachedPrice.price,
        source: 'cache'
      };
    }
    
    throw error;
  }
};
