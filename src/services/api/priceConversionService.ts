
import { fetchCurrentTokenPrice, PriceResult } from './currentPriceService';

/**
 * Converts USD value to token amount using current price
 * @param usdAmount USD amount to convert
 * @param tokenPrice Current token price (optional, will fetch if not provided)
 * @returns Promise with token amount
 */
export const convertUsdToTokenAmount = async (usdAmount: number, tokenPrice?: number | PriceResult): Promise<number> => {
  let price: number;
  
  if (tokenPrice === undefined) {
    const priceResult = await fetchCurrentTokenPrice();
    price = priceResult.price;
  } else if (typeof tokenPrice === 'number') {
    price = tokenPrice;
  } else {
    price = tokenPrice.price;
  }
  
  if (price <= 0) return 0;
  return usdAmount / price;
};

/**
 * Converts token amount to USD value using current price
 * @param tokenAmount Token amount to convert
 * @param tokenPrice Current token price (optional, will fetch if not provided)
 * @returns Promise with USD amount
 */
export const convertTokenAmountToUsd = async (tokenAmount: number, tokenPrice?: number | PriceResult): Promise<number> => {
  let price: number;
  
  if (tokenPrice === undefined) {
    const priceResult = await fetchCurrentTokenPrice();
    price = priceResult.price;
  } else if (typeof tokenPrice === 'number') {
    price = tokenPrice;
  } else {
    price = tokenPrice.price;
  }
  
  return tokenAmount * price;
};
