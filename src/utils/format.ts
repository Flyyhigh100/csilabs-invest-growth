
/**
 * Format a number as currency
 */
export const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numAmount);
};

/**
 * Format a date string
 */
export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format crypto amount with cryptocurrency symbol
 */
export const formatCryptoAmount = (amount: number | string, currency: string = 'BTC') => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${numAmount.toFixed(8)} ${currency}`;
};
