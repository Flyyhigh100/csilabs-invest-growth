/**
 * Centralized Token Configuration
 * This file contains all token-related constants to ensure consistency across the application
 */

// Primary token configuration (CSL Token)
export const CSL_TOKEN_ADDRESS = '0xcba5ca199bca0af3f6046da01169035f2c6a7ff0';
export const CSL_TOKEN_SYMBOL = 'CSL';
export const CSL_TOKEN_NAME = 'CSI Token';

// Fallback token for testing (WETH - known active token)
export const WETH_TOKEN_ADDRESS = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';
export const WETH_TOKEN_SYMBOL = 'WETH';
export const WETH_TOKEN_NAME = 'Wrapped Ether';

// Default token to use in components
export const DEFAULT_TOKEN_ADDRESS = CSL_TOKEN_ADDRESS;
export const DEFAULT_TOKEN_SYMBOL = CSL_TOKEN_SYMBOL;
export const DEFAULT_TOKEN_NAME = CSL_TOKEN_NAME;

// Chain configuration
export const CHAIN_ID = '137'; // Polygon mainnet
export const CHAIN_NAME = 'Polygon';