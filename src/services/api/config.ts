/**
 * API Configuration for Token Data
 * 
 * These settings control how token data is fetched from the API.
 * If the API key is not provided, the system will use mock data.
 */

// Base configuration for Defined.fi API
export const API_BASE_URL = 'https://api.defined.fi';

// API key from custom instructions
export const API_KEY = '3fe52a290da2025bdddcc45a353c0268810eacf7';  // Defined.fi API key

// Token configuration - New token on Polygon network
export const TOKEN_ADDRESS = '0xcba5ca199bca0af3f6046da01169035f2c6a7ff0';  // New token address
export const CHAIN_ID = '137';  // Polygon mainnet
export const QUOTE_TOKEN = 'token1';  // Quote in USD

// Time range settings
export const TIME_RANGE = 'all';  // Get all available data
export const START_DATE = Math.floor(new Date('2021-10-26').getTime() / 1000);  // Oct 26, 2021
export const END_DATE = Math.floor(new Date().getTime() / 1000);  // Current time
export const AGGREGATION_DAYS = 1;  // No aggregation, show daily data

// For charts
export const DAYS_TO_INCLUDE = 90;  // Show last 90 days for short-term chart

// For logging
export const ENABLE_LOGGING = true;  // Enable detailed logging for debugging
