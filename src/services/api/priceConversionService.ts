
import { fetchCurrentTokenPrice } from './currentPriceService';

/**
 * Converts USD value to token amount using current price
 * @param usdAmount USD amount to convert
 * @param tokenPrice Current token price (optional, will fetch if not provided)
 * @returns Promise with token amount
 */
export const convertUsdToTokenAmount = async (usdAmount: number, tokenPrice?: number): Promise<number> => {
  const price = tokenPrice || await fetchCurrentTokenPrice();
  if (price <= 0) return 0;
  return usdAmount / price;
};

/**
 * Converts token amount to USD value using current price
 * @param tokenAmount Token amount to convert
 * @param tokenPrice Current token price (optional, will fetch if not provided)
 * @returns Promise with USD amount
 */
export const convertTokenAmountToUsd = async (tokenAmount: number, tokenPrice?: number): Promise<number> => {
  const price = tokenPrice || await fetchCurrentTokenPrice();
  return tokenAmount * price;
};
