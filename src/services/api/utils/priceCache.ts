
import { PRICE_CACHE_DURATION, FORCE_REFRESH_CACHE } from '../config';
import { isValidPrice, isValidPriceChange } from './priceValidation';

interface CachedPrice {
  price: number;
  timestamp: number;
}

// Cache mechanism for current price
let cachedCurrentPrice: CachedPrice | null = null;

// Load initial price from localStorage if available
try {
  const storedPrice = localStorage.getItem('lastValidPrice');
  if (storedPrice) {
    const parsed = JSON.parse(storedPrice);
    if (isValidPrice(parsed.price)) {
      cachedCurrentPrice = parsed;
    }
  }
} catch (error) {
  console.warn('Failed to load cached price from localStorage:', error);
}

export const getCachedPrice = () => cachedCurrentPrice;

export const setCachedPrice = (price: number) => {
  // Don't cache invalid prices
  if (!isValidPrice(price)) {
    console.warn('Attempted to cache invalid price:', price);
    return false;
  }
  
  // Check for suspicious price changes if we have a cached price
  if (cachedCurrentPrice?.price) {
    if (!isValidPriceChange(price, cachedCurrentPrice.price)) {
      console.warn('Suspicious price change rejected:', {
        oldPrice: cachedCurrentPrice.price,
        newPrice: price
      });
      return false;
    }
  }
  
  const timestamp = Date.now();
  cachedCurrentPrice = { price, timestamp };
  
  // Also store in localStorage for persistence
  try {
    localStorage.setItem('lastValidPrice', JSON.stringify(cachedCurrentPrice));
  } catch (error) {
    console.warn('Failed to persist price to localStorage:', error);
  }
  
  console.log('Cached new price:', price, 'at:', new Date(timestamp).toISOString());
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

