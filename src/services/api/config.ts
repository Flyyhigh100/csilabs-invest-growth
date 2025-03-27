
// Configuration for the Defined.fi API

// Base URL for the API
export const API_BASE_URL = 'https://api.defined.fi';

// API key from the knowledge base
export const API_KEY = '3fe52a290da2025bdddcc45a353c0268810eacf7';

// Token address on Polygon
export const TOKEN_ADDRESS = '0xdcea55a12105335d1c2f8972f3b80965a7e07847';

// Additional parameters for API requests
export const TIME_RANGE = 'all'; // Using 'all' to get all available data

// Chain ID for Polygon
export const CHAIN_ID = 137; 

// Date configuration - October 26, 2021 in seconds (start of our data range)
export const START_DATE = Math.floor(new Date('2021-10-26').getTime() / 1000);

// End date - Current
export const END_DATE = Math.floor(Date.now() / 1000);

// Define the aggregation period - set to 0 for no aggregation, showing all data points
export const AGGREGATION_DAYS = 0;

// Quote token (USDC)
export const QUOTE_TOKEN = 'token1'; // As seen in the Defined.fi URL

// Number of days to include in the time frame (set to a large number to ensure all data is included)
export const DAYS_TO_INCLUDE = 1000; // ~3 years worth of days
