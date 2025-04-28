/**
 * API Configuration for Token Data
 */

// Token Configuration
export const TOKEN_ADDRESS = '0x03f8fe849404dca3ae3e16ac4ff0b240dbc139f4';  // Updated token address
export const CHAIN_ID = '137';  // Polygon mainnet

// Uniswap V3 Configuration
export const UNISWAP_V3_POOL = (import.meta.env?.VITE_V3_POOL as string | undefined)?.toLowerCase() || '0x03f8fe849404dca3ae3e16ac4ff0b240dbc139f4';
export const UNISWAP_V4_POOL = (import.meta.env?.VITE_V4_POOL as string | undefined)?.toLowerCase() || '0xe5c4a49b28f71506cdc43a48552804e8b7e7b3a727bb9b40d955ba69ec28976d';

export const COUNTER_TOKEN_SYMBOL = 'USDT';
export const COUNTER_TOKEN_DECIMALS = 6;

export const UNISWAP_V3_URL = import.meta.env?.VITE_V3_URL || 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon';
export const UNISWAP_V4_URL = import.meta.env?.VITE_V4_URL || 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v4-polygon';

// Legacy constant used by existing services (points to V3 by default)
export const UNISWAP_SUBGRAPH_URL = UNISWAP_V3_URL;

// Time range settings
export const START_DATE = Math.floor(new Date('2021-10-26').getTime() / 1000);
export const END_DATE = Math.floor(new Date().getTime() / 1000);
export const DAYS_TO_INCLUDE = 90;

// Cache settings
export const PRICE_CACHE_DURATION = 10000; // 10 seconds to match polling interval
export const FORCE_REFRESH_CACHE = false;
export const STABLE_PRICE_THRESHOLD = 0.0001; // 0.01% change threshold for stable price

// Validation thresholds
export const MAX_PRICE_CHANGE_PERCENTAGE = 50; // Maximum allowed price change (50%)
export const MIN_VALID_PRICE = 0.00001; // Minimum valid price
export const MAX_VALID_PRICE = 2; // Maximum valid price

// For logging
export const ENABLE_LOGGING = true;

// Max retries for API calls
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // Base delay in ms for exponential backoff
