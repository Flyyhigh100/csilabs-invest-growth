
interface MinimumAmounts {
  [key: string]: number;
}

// Minimum amounts in USD for each currency to cover network fees
const MINIMUM_AMOUNTS: MinimumAmounts = {
  'BTC': 2,
  'ETH': 2,
  'USDT': 2,
  'USDC': 2,
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

interface AddressFormat {
  name: string;
  regex: RegExp;
  networkName: string;
  currencyCodes: string[];
  prefix?: string;
}

// Define address formats for different cryptocurrencies
const ADDRESS_FORMATS: AddressFormat[] = [
  {
    name: 'ethereum',
    regex: /^0x[a-fA-F0-9]{40}$/,
    networkName: 'ERC-20',
    currencyCodes: ['ETH', 'USDT.ERC20', 'USDC.ERC20'],
    prefix: '0x'
  },
  {
    name: 'binance-smart-chain',
    regex: /^0x[a-fA-F0-9]{40}$/,
    networkName: 'BEP-20',
    currencyCodes: ['BNB.BSC', 'BUSD.BSC', 'USDT.BSC'],
    prefix: '0x'
  },
  {
    name: 'bitcoin',
    regex: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/,
    networkName: 'Bitcoin',
    currencyCodes: ['BTC'],
    prefix: null
  },
  {
    name: 'litecoin',
    regex: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
    networkName: 'Litecoin',
    currencyCodes: ['LTC'],
    prefix: null
  },
  {
    name: 'dogecoin',
    regex: /^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/,
    networkName: 'Dogecoin',
    currencyCodes: ['DOGE'],
    prefix: 'D'
  },
  {
    name: 'tron',
    regex: /^T[a-zA-Z0-9]{33}$/,
    networkName: 'TRON',
    currencyCodes: ['TRX', 'USDT.TRC20'],
    prefix: 'T'
  },
  {
    name: 'polygon',
    regex: /^0x[a-fA-F0-9]{40}$/,
    networkName: 'Polygon',
    currencyCodes: ['MATIC', 'USDT.POLYGON', 'USDC.POLYGON'],
    prefix: '0x'
  }
];

/**
 * Clean cryptocurrency payment address by removing prefixes like "ethereum:".
 * This ensures that addresses are consistently formatted for display and use.
 */
export function cleanPaymentAddress(address: string): string {
  if (!address) return '';
  
  // Remove any protocol prefix like ethereum:, bitcoin:, etc.
  return address.replace(/^[a-z]+:/, '');
}

/**
 * Get the network name for a given currency code
 */
export function getNetworkName(currencyCode: string): string {
  const format = ADDRESS_FORMATS.find(format => 
    format.currencyCodes.includes(currencyCode)
  );
  
  return format?.networkName || 'Cryptocurrency';
}

/**
 * Validate a cryptocurrency address for a specific currency
 */
export function validateAddress(address: string, currencyCode: string): { 
  isValid: boolean;
  format?: AddressFormat;
  message?: string;
} {
  if (!address) {
    return { isValid: false, message: 'Address is empty' };
  }

  const cleanedAddress = cleanPaymentAddress(address);
  
  // Find the format that matches the currency code
  const expectedFormat = ADDRESS_FORMATS.find(format => 
    format.currencyCodes.includes(currencyCode)
  );
  
  if (!expectedFormat) {
    // For unknown currencies, accept the address as valid (fallback)
    console.warn(`No validation rule found for currency: ${currencyCode}`);
    return { isValid: true };
  }
  
  if (expectedFormat.regex.test(cleanedAddress)) {
    return { isValid: true, format: expectedFormat };
  }
  
  return { 
    isValid: false, 
    format: expectedFormat,
    message: `Invalid ${expectedFormat.networkName} address format` 
  };
}

/**
 * Detect address format without knowing the currency
 */
export function detectAddressFormat(address: string): { 
  isValid: boolean;
  format?: AddressFormat;
  message?: string;
} {
  if (!address) {
    return { isValid: false, message: 'Address is empty' };
  }
  
  const cleanedAddress = cleanPaymentAddress(address);
  
  // Try each format to see if the address matches
  for (const format of ADDRESS_FORMATS) {
    if (format.regex.test(cleanedAddress)) {
      return { isValid: true, format };
    }
  }
  
  return { 
    isValid: false, 
    message: 'Unrecognized address format' 
  };
}

/**
 * Create an appropriate URI for a cryptocurrency QR code
 */
export function createQrCodeUriData(address: string, amount?: string, currency?: string): string {
  const cleanedAddress = cleanPaymentAddress(address);
  const format = detectAddressFormat(cleanedAddress);
  
  if (!format.isValid) {
    // If we can't detect the format, just return the address
    return cleanedAddress;
  }
  
  switch (format.format?.name) {
    case 'bitcoin':
      let uri = `bitcoin:${cleanedAddress}`;
      if (amount) uri += `?amount=${amount}`;
      return uri;
    
    case 'litecoin':
      return amount ? `litecoin:${cleanedAddress}?amount=${amount}` : `litecoin:${cleanedAddress}`;
    
    case 'ethereum':
      return JSON.stringify({
        address: cleanedAddress,
        network: 'ETH',
        amount: amount || undefined
      });
    
    case 'binance-smart-chain':
      return JSON.stringify({
        address: cleanedAddress,
        network: 'BSC',
        amount: amount || undefined
      });
      
    default:
      // For other formats, return generic JSON
      return JSON.stringify({
        address: cleanedAddress,
        currency: currency,
        amount: amount || undefined
      });
  }
}
