
import { PRICE_CACHE_DURATION, FORCE_REFRESH_CACHE } from '../config';
import { isValidPrice, isValidPriceChange } from './priceValidation';

// Cache mechanism for current price
let cachedCurrentPrice: { price: number; timestamp: number } | null = null;

export { PRICE_CACHE_DURATION };

export const getCachedPrice = () => cachedCurrentPrice;

export const setCachedPrice = (price: number) => {
  // Don't cache invalid prices
  if (!isValidPrice(price)) {
    console.warn('Attempted to cache invalid price:', price);
    return false;
  }
  
  // Check for suspicious price changes
  if (cachedCurrentPrice?.price) {
    if (!isValidPriceChange(price, cachedCurrentPrice.price)) {
      console.warn('Suspicious price change rejected');
      return false;
    }
  }
  
  console.log('Caching new price:', price, 'at:', new Date().toISOString());
  cachedCurrentPrice = { price, timestamp: Date.now() };
  return true;
};

export const getTimeUntilNextPriceRefresh = (): number => {
  if (!cachedCurrentPrice) return 0;
  
  const elapsed = Date.now() - cachedCurrentPrice.timestamp;
  if (elapsed >= PRICE_CACHE_DURATION) return 0;
  
  return PRICE_CACHE_DURATION - elapsed;
};

export const getPriceLastUpdatedTime = (): number | null => {
  return cachedCurrentPrice ? cachedCurrentPrice.timestamp : null;
};

export const shouldRefreshPrice = (): boolean => {
  if (FORCE_REFRESH_CACHE) return true;
  if (!cachedCurrentPrice) return true;
  
  const elapsed = Date.now() - cachedCurrentPrice.timestamp;
  return elapsed >= PRICE_CACHE_DURATION;
};

export const invalidateCache = () => {
  console.log('Invalidating price cache at:', new Date().toISOString());
  cachedCurrentPrice = null;
};
