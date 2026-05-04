import { STATIC_TOKEN_PRICE } from './staticPrice';
import type { PriceResult } from './currentPriceService';

const resolvePrice = (tokenPrice?: number | PriceResult): number => {
  if (tokenPrice === undefined) return STATIC_TOKEN_PRICE;
  if (typeof tokenPrice === 'number') return tokenPrice > 0 ? tokenPrice : STATIC_TOKEN_PRICE;
  return tokenPrice.price > 0 ? tokenPrice.price : STATIC_TOKEN_PRICE;
};

export const convertUsdToTokenAmount = async (
  usdAmount: number,
  tokenPrice?: number | PriceResult
): Promise<number> => {
  const price = resolvePrice(tokenPrice);
  return usdAmount / price;
};

export const convertTokenAmountToUsd = async (
  tokenAmount: number,
  tokenPrice?: number | PriceResult
): Promise<number> => {
  const price = resolvePrice(tokenPrice);
  return tokenAmount * price;
};
