
// Configuration for the Defined.fi API

// Base URL for the API
export const API_BASE_URL = 'https://api.defined.fi';

// API key from the knowledge base
export const API_KEY = '3fe52a290da2025bdddcc45a353c0268810eacf7';

// Token address on Polygon
export const TOKEN_ADDRESS = '0xdcea55a12105335d1c2f8972f3b80965a7e07847';

// Additional parameters for API requests
export const TIME_RANGE = 'all'; // Using 'all' to get all available data since 2021
export const CHAIN_ID = 137; // Polygon chain ID

// Date configuration for filtering data - October 26, 2021 in seconds
export const START_DATE = new Date('2021-10-26').getTime() / 1000;
