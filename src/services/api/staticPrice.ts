/**
 * Single source of truth for the publicly displayed token price.
 * Per client request (May 2026), the price is locked at $1.00 USD per coin
 * across the marketing site and dashboard purchase calculations.
 *
 * To re-enable dynamic pricing later, replace consumers of this constant
 * with the previous `fetchCurrentTokenPrice` flow.
 */
export const STATIC_TOKEN_PRICE = 1.0;
export const STATIC_PRICE_SOURCE = 'static' as const;
