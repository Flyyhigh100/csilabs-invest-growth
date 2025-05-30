
/**
 * API Configuration for Token Data
 */

// Token Configuration
export const TOKEN_ADDRESS = '0xcba5ca199bca0af3f6046da01169035f2c6a7ff0';  // CSL token address
export const CHAIN_ID = '137';  // Polygon mainnet

// Uniswap V3 Pool Configuration
export const UNISWAP_V3_POOL = (import.meta.env?.VITE_V3_POOL as string | undefined)?.toLowerCase() || '0xb85372c56884a906ab33c0e99fea572c7c6ad7eb';

// Token configuration
export const V3_TOKEN0 = (import.meta.env?.VITE_V3_TOKEN0 as string | undefined)?.toLowerCase() || '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359';
export const V3_TOKEN1 = (import.meta.env?.VITE_V3_TOKEN1 as string | undefined)?.toLowerCase() || '0xcba5ca199bca0af3f6046da01169035f2c6a7ff0';
export const V3_TOKEN0_DECIMALS = parseInt(import.meta.env?.VITE_V3_TOKEN0_DECIMALS as string || '6');
export const V3_TOKEN1_DECIMALS = parseInt(import.meta.env?.VITE_V3_TOKEN1_DECIMALS as string || '18');

export const COUNTER_TOKEN_SYMBOL = (import.meta.env?.VITE_COUNTER_TOKEN_SYMBOL as string | undefined) || 'USDC';
export const COUNTER_TOKEN_DECIMALS = 6;

// Uniswap V3 endpoint - updated to use the new working Graph API URL
export const UNISWAP_V3_URL = import.meta.env?.VITE_V3_URL || 'https://gateway.thegraph.com/api/39814f0ec0acd4d370f434eefa12fa7c/subgraphs/id/3hCPRGf4z88VC5rsBKU5AA9FBBq5nF3jbKJG7VZCbhjm';

// Legacy constant used by existing services (points to V3)
export const UNISWAP_SUBGRAPH_URL = UNISWAP_V3_URL;

// Time range settings
export const START_DATE = Math.floor(new Date('2021-10-26').getTime() / 1000);
export const END_DATE = Math.floor(new Date().getTime() / 1000);
export const DAYS_TO_INCLUDE = 90;

// Cache settings 
export const PRICE_CACHE_DURATION = 10000; // 10 seconds to match polling interval
export const ENABLE_LOGGING = true;

// Validation thresholds - updated based on expected CSL price range
export const MAX_PRICE_CHANGE_PERCENTAGE = 50; // Maximum allowed price change (50%)
export const MIN_VALID_PRICE = 0.1; // Minimum valid price (updated from 0.00001 to 0.1)
export const MAX_VALID_PRICE = 10; // Maximum valid price (updated to 10 based on expected range)

// Max retries for API calls
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // Base delay in ms for exponential backoff
export const FORCE_REFRESH_CACHE = true; // Temporarily set to true to refresh cached prices
export const STABLE_PRICE_THRESHOLD = 0.0001;
