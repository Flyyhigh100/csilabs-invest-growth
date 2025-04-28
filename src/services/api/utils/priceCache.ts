
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
