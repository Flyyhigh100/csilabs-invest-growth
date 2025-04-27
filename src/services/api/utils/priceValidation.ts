
import { MAX_PRICE_CHANGE_PERCENTAGE, MIN_VALID_PRICE } from '../config';

export function isValidPrice(price: number | string | null | undefined): boolean {
  // Convert to number if string
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Basic validity checks
  if (
    numericPrice === null ||
    numericPrice === undefined ||
    isNaN(Number(numericPrice)) ||
    numericPrice < MIN_VALID_PRICE ||
    numericPrice > 2 // Maximum reasonable price threshold
  ) {
    console.warn('Invalid price detected:', numericPrice);
    return false;
  }
  
  return true;
}

export function isValidPriceChange(newPrice: number, oldPrice: number): boolean {
  if (!isValidPrice(newPrice) || !isValidPrice(oldPrice)) return false;
  
  const priceChange = Math.abs(newPrice - oldPrice);
  const changePercentage = (priceChange / oldPrice) * 100;
  
  if (changePercentage > MAX_PRICE_CHANGE_PERCENTAGE) {
    console.warn(`Suspicious price change detected: ${changePercentage.toFixed(2)}%`);
    console.warn(`Old price: ${oldPrice}, New price: ${newPrice}`);
    return false;
  }
  
  return true;
}
