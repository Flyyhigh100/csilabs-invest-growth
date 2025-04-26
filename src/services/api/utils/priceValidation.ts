
/**
 * Validates if a price value is valid
 * @param price The price to validate
 * @returns boolean indicating if price is valid
 */
export function isValidPrice(price: number | string | null | undefined): boolean {
  // Convert to number if string
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Check if it's a valid number greater than zero
  return (
    numericPrice !== null &&
    numericPrice !== undefined &&
    !isNaN(Number(numericPrice)) &&
    numericPrice > 0
  );
}
