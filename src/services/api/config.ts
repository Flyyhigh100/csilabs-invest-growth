/**
 * API Configuration for Token Data
 */

// Token Configuration
export const TOKEN_ADDRESS = '0xcba5ca199bca0af3f6046da01169035f2c6a7ff0';  // Token address
export const CHAIN_ID = '137';  // Polygon mainnet

// Uniswap V3 Configuration
export const UNISWAP_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2-polygon';

// Time range settings
export const START_DATE = Math.floor(new Date('2021-10-26').getTime() / 1000);
export const END_DATE = Math.floor(new Date().getTime() / 1000);
export const DAYS_TO_INCLUDE = 90;

// Cache settings
export const PRICE_CACHE_DURATION = 30000; // 30 seconds
export const FORCE_REFRESH_CACHE = true;

// For logging
export const ENABLE_LOGGING = true;

// Max retries for API calls
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // Base delay in ms for exponential backoff
