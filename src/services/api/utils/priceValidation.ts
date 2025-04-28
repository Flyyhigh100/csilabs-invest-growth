
import { MAX_VALID_PRICE, MIN_VALID_PRICE } from '../config';

/**
 * Validates if a price value is considered valid based on predefined constraints
 * 
 * @param price - The price value to validate
 * @returns boolean indicating if the price is valid
 */
export const isValidPrice = (price: any): boolean => {
  // Check if price is null, undefined or NaN
  if (price === null || price === undefined || isNaN(price)) {
    console.warn('Price validation failed: price is null, undefined or NaN');
    return false;
  }

  // Convert to number if it's a string
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Check if price is in valid range
  if (numericPrice < MIN_VALID_PRICE) {
    console.warn(`Price validation failed: ${numericPrice} is below minimum valid price ${MIN_VALID_PRICE}`);
    return false;
  }
  
  if (numericPrice > MAX_VALID_PRICE) {
    console.warn(`Price validation failed: ${numericPrice} is above maximum valid price ${MAX_VALID_PRICE}`);
    return false;
  }
  
  return true;
};
