
/**
 * API Configuration for Token Data
 */

// Moralis Configuration
export const MORALIS_BASE_URL = 'https://deep-index.moralis.io/api/v2';
export const MORALIS_CHAIN = '0x89'; // Polygon mainnet in hex format
export const TOKEN_ADDRESS = '0xcba5ca199bca0af3f6046da01169035f2c6a7ff0';  // Token address
export const CHAIN_ID = '137';  // Polygon mainnet

// For backward compatibility - empty string will trigger the proper Supabase secret usage
export const API_KEY = '';  // This will be fetched from Supabase secrets

// Time range settings
export const START_DATE = Math.floor(new Date('2021-10-26').getTime() / 1000);  // Oct 26, 2021
export const END_DATE = Math.floor(new Date().getTime() / 1000);  // Current time
export const DAYS_TO_INCLUDE = 90;  // Show last 90 days for short-term chart

// Cache settings - consolidated to single source of truth
export const PRICE_CACHE_DURATION = 30000; // 30 seconds
export const FORCE_REFRESH_CACHE = true; // Force cache refresh on component mount

// For logging
export const ENABLE_LOGGING = true;  // Enable detailed logging for debugging
