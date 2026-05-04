import { STATIC_TOKEN_PRICE } from './staticPrice';

// Define the return type with source information
export interface PriceResult {
  price: number;
  source: 'on-chain-v3' | 'defined.fi' | 'dexscreener' | 'cache' | 'static';
}

/**
 * Token price is locked at $1.00 USD per coin (May 2026 client decision).
 * All previous on-chain / Defined.fi / DexScreener / proxy fallbacks are
 * intentionally bypassed. To re-enable dynamic pricing, restore the prior
 * implementation from version control.
 */
export const fetchCurrentTokenPrice = async (
  _forceRefresh: boolean = false
): Promise<PriceResult> => {
  return { price: STATIC_TOKEN_PRICE, source: 'static' };
};
