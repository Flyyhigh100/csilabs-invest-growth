
interface MinimumAmounts {
  [key: string]: number;
}

// Minimum amounts in USD for each currency to cover network fees
const MINIMUM_AMOUNTS: MinimumAmounts = {
  'BTC': 10,
  'ETH': 10,
  'USDT': 10,
  'USDC': 10,
  'BNB.BSC': 10,
  'LTC': 10,
  'DOGE': 10,
  'TRX': 10,
  'MATIC': 10
};

export function validateCryptoAmount(amount: number, currency: string): { isValid: boolean; message?: string } {
  const minAmount = MINIMUM_AMOUNTS[currency] || 10; // Default to $10 if currency not listed
  
  if (amount < minAmount) {
    return {
      isValid: false,
      message: `Minimum amount for ${currency} payments is $${minAmount} USD to cover network fees`
    };
  }
  
  return { isValid: true };
}
