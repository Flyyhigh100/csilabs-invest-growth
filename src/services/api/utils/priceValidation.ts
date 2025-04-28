
import { MAX_PRICE_CHANGE_PERCENTAGE, MIN_VALID_PRICE, MAX_VALID_PRICE } from '../config';

export function isValidPrice(price: number | string | null | undefined): boolean {
  // Convert to number if string
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Basic validity checks
  if (
    numericPrice === null ||
    numericPrice === undefined ||
    isNaN(Number(numericPrice)) ||
    numericPrice < MIN_VALID_PRICE ||
    numericPrice > MAX_VALID_PRICE
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
  
  // Get time since last update from localStorage
  let lastUpdateTime = 0;
  try {
    const stored = localStorage.getItem('lastValidPrice');
    if (stored) {
      lastUpdateTime = JSON.parse(stored).timestamp;
    }
  } catch (error) {
    console.warn('Error reading last update time:', error);
  }
  
  // Adjust validation based on time since last update
  const hoursSinceUpdate = (Date.now() - lastUpdateTime) / (1000 * 60 * 60);
  const adjustedThreshold = MAX_PRICE_CHANGE_PERCENTAGE * Math.min(hoursSinceUpdate / 24, 2);
  
  if (changePercentage > adjustedThreshold) {
    console.warn(`Suspicious price change detected: ${changePercentage.toFixed(2)}%`);
    console.warn(`Old price: ${oldPrice}, New price: ${newPrice}`);
    return false;
  }
  
  return true;
}

