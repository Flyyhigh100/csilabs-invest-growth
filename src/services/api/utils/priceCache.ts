
// Cache mechanism for current price
let cachedCurrentPrice: { price: number; timestamp: number } | null = null;
export const PRICE_CACHE_DURATION = 10000; // Reduced to 10 seconds from 30

export const getCachedPrice = () => cachedCurrentPrice;

export const setCachedPrice = (price: number) => {
  if (!isValidPriceChange(price)) {
    console.warn('Suspicious price change detected:', price);
    return; // Don't cache suspicious price changes
  }
  cachedCurrentPrice = { price, timestamp: Date.now() };
};

// Validate price changes to prevent caching obviously wrong values
const isValidPriceChange = (newPrice: number): boolean => {
  if (!cachedCurrentPrice) return true; // Accept first price
  
  const priceChange = Math.abs(newPrice - cachedCurrentPrice.price);
  const changePercentage = (priceChange / cachedCurrentPrice.price) * 100;
  
  // Log significant price changes
  if (changePercentage > 5) {
    console.log(`Significant price change detected: ${changePercentage.toFixed(2)}%`);
    console.log(`Old price: ${cachedCurrentPrice.price}, New price: ${newPrice}`);
  }
  
  // Reject extreme price changes (>50%)
  return changePercentage <= 50;
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

export const invalidateCache = () => {
  cachedCurrentPrice = null;
};
