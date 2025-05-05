
/**
 * API Configuration for Token Data
 */

// Token Configuration
export const TOKEN_ADDRESS = '0xcba5ca199bca0af3f6046da01169035f2c6a7ff0';  // CSL token address
export const CHAIN_ID = '137';  // Polygon mainnet

// Uniswap Pool Configuration
export const UNISWAP_V3_POOL = (import.meta.env?.VITE_V3_POOL as string | undefined)?.toLowerCase() || '0x03f8fe849404dca3ae3e16ac4ff0b240dbc139f4';
export const UNISWAP_V4_POOL = (import.meta.env?.VITE_V4_POOL as string | undefined)?.toLowerCase() || '0x7d3640d16367d75ebe808b3b22cd60a70aea6c1c3a72be45082736e3fbb6040c';

export const COUNTER_TOKEN_SYMBOL = (import.meta.env?.VITE_COUNTER_TOKEN_SYMBOL as string | undefined) || 'USDC';
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
export const ENABLE_LOGGING = true;

// TWAP settings
export const V4_TWAP_COLLECTION_INTERVAL = 2 * 60 * 1000; // 2 minutes
export const V4_TWAP_WINDOW_SEC = 900; // 15 minutes (same as V3)

// Validation thresholds
export const MAX_PRICE_CHANGE_PERCENTAGE = 50; // Maximum allowed price change (50%)
export const MIN_VALID_PRICE = 0.00001; // Minimum valid price
export const MAX_VALID_PRICE = 1000; // Maximum valid price - increased from 2 to 1000

// Max retries for API calls
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // Base delay in ms for exponential backoff
export const FORCE_REFRESH_CACHE = true; // Temporarily set to true to refresh cached prices
export const STABLE_PRICE_THRESHOLD = 0.0001;
