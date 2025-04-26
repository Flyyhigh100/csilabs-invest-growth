// Re-export all price-related functionality
export { fetchTokenPriceHistory } from './historicalPriceService';
export { fetchCurrentTokenPrice } from './currentPriceService';
export { convertUsdToTokenAmount, convertTokenAmountToUsd } from './priceConversionService';
export { getTimeUntilNextPriceRefresh, getPriceLastUpdatedTime } from './utils/priceCache';

export const GRAPH_KEY      = import.meta.env.VITE_GRAPH_API_KEY;
export const V3_ID          = import.meta.env.VITE_V3_SUBGRAPH_ID;
export const V4_ID          = import.meta.env.VITE_V4_SUBGRAPH_ID;
export const V3_POOL        = import.meta.env.VITE_V3_POOL;

export const UNISWAP_V3_URL =
  `https://gateway.thegraph.com/api/${GRAPH_KEY}/subgraphs/id/${V3_ID}`;
export const UNISWAP_V4_URL =
  `https://gateway.thegraph.com/api/${GRAPH_KEY}/subgraphs/id/${V4_ID}`;

const PAIR = import.meta.env.VITE_PAIR_ADDRESS?.toLowerCase() ||
             '0x03f8fe849404dca3ae3e16ac4ff0b240dbc139f4';
