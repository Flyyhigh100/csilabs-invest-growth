
interface MinimumAmounts {
  [key: string]: number;
}

// Minimum amounts in USD for each currency to cover network fees
const MINIMUM_AMOUNTS: MinimumAmounts = {
  'BTC': 2,
  'ETH': 2,
  'USDT': 1, // Reduced from 2 to 1 for stablecoins used in direct crypto payments
  'USDC': 1, // Reduced from 2 to 1 for stablecoins used in direct crypto payments
  'BNB.BSC': 2,
  'LTC': 2,
  'DOGE': 2,
  'TRX': 2,
  'MATIC': 2
};

export function validateCryptoAmount(amount: number, currency: string): { isValid: boolean; message?: string } {
  const minAmount = MINIMUM_AMOUNTS[currency] || 2; // Default to $2 if currency not listed
  
  if (amount < minAmount) {
    return {
      isValid: false,
      message: `Minimum amount for ${currency} payments is $${minAmount} USD to cover network fees`
    };
  }
  
  return { isValid: true };
}
