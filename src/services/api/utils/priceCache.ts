
// Cache mechanism for current price
let cachedCurrentPrice: { price: number; timestamp: number } | null = null;
export const PRICE_CACHE_DURATION = 30000; // 30 seconds cache

export const getCachedPrice = () => cachedCurrentPrice;

export const setCachedPrice = (price: number) => {
  cachedCurrentPrice = { price, timestamp: Date.now() };
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
