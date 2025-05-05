
// Re-export all price-related functionality
export { fetchTokenPriceHistory } from './historicalPriceService';
export { fetchCurrentTokenPrice } from './currentPriceService';
export type { PriceResult } from './currentPriceService';
export { convertUsdToTokenAmount, convertTokenAmountToUsd } from './priceConversionService';
export { getTimeUntilNextPriceRefresh, getPriceLastUpdatedTime } from './utils/priceCache';

// Constants for graph API access (kept for backward compatibility)
export const GRAPH_KEY = import.meta.env.VITE_GRAPH_API_KEY;
export const V3_ID = import.meta.env.VITE_V3_SUBGRAPH_ID;
export const V4_ID = import.meta.env.VITE_V4_SUBGRAPH_ID;
export const V3_POOL = import.meta.env.VITE_V3_POOL;
