
/**
 * Validates if a price is reasonable (not too high or too low)
 * @param price The price to validate
 * @returns Boolean indicating if price is valid
 */
export const isValidPrice = (price: number): boolean => {
  // Allow for micro-priced tokens (8 decimal places)
  const MIN_ACCEPTABLE_PRICE = 0.00000001;
  const MAX_ACCEPTABLE_PRICE = 100;  // Maximum price cap for sanity check
  
  return price >= MIN_ACCEPTABLE_PRICE && price <= MAX_ACCEPTABLE_PRICE;
};
