
/**
 * API Configuration for Token Data
 */

// Moralis Configuration
export const MORALIS_BASE_URL = 'https://deep-index.moralis.io/api/v2';
export const MORALIS_CHAIN = '0x89'; // Polygon mainnet in hex format
export const API_KEY = '3fe52a290da2025bdddcc45a353c0268810eacf7';  // Moralis API key

// Token configuration - Token on Polygon network
export const TOKEN_ADDRESS = '0xcba5ca199bca0af3f6046da01169035f2c6a7ff0';  // Token address
export const CHAIN_ID = '137';  // Polygon mainnet

// Time range settings
export const START_DATE = Math.floor(new Date('2021-10-26').getTime() / 1000);  // Oct 26, 2021
export const END_DATE = Math.floor(new Date().getTime() / 1000);  // Current time
export const DAYS_TO_INCLUDE = 90;  // Show last 90 days for short-term chart

// For logging
export const ENABLE_LOGGING = true;  // Enable detailed logging for debugging
