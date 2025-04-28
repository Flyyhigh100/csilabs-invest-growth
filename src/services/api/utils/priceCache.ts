
import { PRICE_CACHE_DURATION } from '../config';

interface CachedPrice {
  price: number;
  timestamp: number;
}

let cachedCurrentPrice: CachedPrice | null = null;

// Load initial price from localStorage if available
try {
  const storedPrice = localStorage.getItem('lastValidPrice');
  if (storedPrice) {
    cachedCurrentPrice = JSON.parse(storedPrice);
  }
} catch (error) {
  console.warn('Failed to load cached price from localStorage:', error);
}

export const getCachedPrice = () => cachedCurrentPrice;

export const setCachedPrice = (price: number) => {
  const timestamp = Date.now();
  cachedCurrentPrice = { price, timestamp };
  
  try {
    localStorage.setItem('lastValidPrice', JSON.stringify(cachedCurrentPrice));
  } catch (error) {
    console.warn('Failed to persist price to localStorage:', error);
  }
  
  return true;
};

export const shouldRefreshPrice = (): boolean => {
  if (!cachedCurrentPrice) return true;
  const elapsed = Date.now() - cachedCurrentPrice.timestamp;
  return elapsed >= PRICE_CACHE_DURATION;
};

/**
 * Gets the time in milliseconds until the next price refresh is needed
 */
export const getTimeUntilNextPriceRefresh = (): number => {
  if (!cachedCurrentPrice) return 0;
  
  const elapsed = Date.now() - cachedCurrentPrice.timestamp;
  const remaining = PRICE_CACHE_DURATION - elapsed;
  
  return remaining > 0 ? remaining : 0;
};

/**
 * Gets the timestamp when the price was last updated
 */
export const getPriceLastUpdatedTime = (): Date | null => {
  if (!cachedCurrentPrice) return null;
  return new Date(cachedCurrentPrice.timestamp);
};
