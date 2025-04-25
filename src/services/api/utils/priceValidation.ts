
/**
 * Validates if a price is reasonable (not too high or too low)
 * @param price The price to validate
 * @returns Boolean indicating if price is valid
 */
export const isValidPrice = (price: number): boolean => {
  // Check if price is a valid number
  if (typeof price !== 'number' || isNaN(price)) {
    console.error('Invalid price type or NaN:', price);
    return false;
  }

  // Check for negative prices
  if (price < 0) {
    console.error('Negative price detected:', price);
    return false;
  }

  // Allow for micro-priced tokens (8 decimal places)
  const MIN_ACCEPTABLE_PRICE = 0.00000001;
  const MAX_ACCEPTABLE_PRICE = 100;  // Maximum price cap for sanity check
  
  const isValid = price >= MIN_ACCEPTABLE_PRICE && price <= MAX_ACCEPTABLE_PRICE;
  
  if (!isValid) {
    console.error(`Price ${price} outside acceptable range [${MIN_ACCEPTABLE_PRICE}, ${MAX_ACCEPTABLE_PRICE}]`);
  }
  
  return isValid;
};
