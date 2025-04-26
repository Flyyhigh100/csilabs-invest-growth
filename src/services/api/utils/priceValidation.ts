
/**
 * Validates if a price is reasonable and properly formatted
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

  // Allow prices down to 8 decimal places
  const MIN_ACCEPTABLE_PRICE = 0.00000001;
  
  const isValid = price >= MIN_ACCEPTABLE_PRICE;
  
  if (!isValid) {
    console.error(`Price ${price} below minimum threshold ${MIN_ACCEPTABLE_PRICE}`);
  }
  
  return isValid;
};
