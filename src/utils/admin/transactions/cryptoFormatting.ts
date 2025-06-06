
/**
 * Utility functions for formatting crypto-related data in transaction tables
 */

export interface CryptoDisplayData {
  symbol?: string;
  network?: string;
  amount?: number;
  paymentAddress?: string;
}

/**
 * Get badge color for crypto networks
 */
export const getNetworkBadgeColor = (network?: string): string => {
  if (!network) return 'bg-gray-100 text-gray-800 border-gray-300';
  
  switch (network.toLowerCase()) {
    case 'ethereum':
    case 'eth':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'polygon':
    case 'matic':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'bsc':
    case 'binance':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'solana':
    case 'sol':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'avalanche':
    case 'avax':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'arbitrum':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'optimism':
      return 'bg-pink-100 text-pink-800 border-pink-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

/**
 * Get badge color for crypto symbols
 */
export const getCryptoBadgeColor = (symbol?: string): string => {
  if (!symbol) return 'bg-gray-100 text-gray-800 border-gray-300';
  
  switch (symbol.toLowerCase()) {
    case 'eth':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'btc':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'usdt':
    case 'usdc':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'bnb':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'sol':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'matic':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'avax':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

/**
 * Format crypto amount with appropriate decimal places
 */
export const formatCryptoAmount = (amount?: number, symbol?: string): string => {
  if (!amount) return '0';
  
  // Different cryptocurrencies have different decimal precision conventions
  const decimals = getCryptoDecimals(symbol);
  return amount.toFixed(decimals);
};

/**
 * Get appropriate decimal places for crypto display
 */
export const getCryptoDecimals = (symbol?: string): number => {
  if (!symbol) return 6;
  
  switch (symbol.toLowerCase()) {
    case 'btc':
      return 8;
    case 'eth':
      return 6;
    case 'usdt':
    case 'usdc':
      return 2;
    case 'bnb':
    case 'sol':
    case 'matic':
    case 'avax':
      return 4;
    default:
      return 6;
  }
};

/**
 * Get blockchain explorer URL for a given network
 */
export const getBlockchainExplorerUrl = (network?: string, address?: string): string | null => {
  if (!network || !address) return null;
  
  switch (network.toLowerCase()) {
    case 'ethereum':
    case 'eth':
      return `https://etherscan.io/address/${address}`;
    case 'polygon':
    case 'matic':
      return `https://polygonscan.com/address/${address}`;
    case 'bsc':
    case 'binance':
      return `https://bscscan.com/address/${address}`;
    case 'solana':
    case 'sol':
      return `https://explorer.solana.com/address/${address}`;
    case 'avalanche':
    case 'avax':
      return `https://snowtrace.io/address/${address}`;
    case 'arbitrum':
      return `https://arbiscan.io/address/${address}`;
    case 'optimism':
      return `https://optimistic.etherscan.io/address/${address}`;
    default:
      return null;
  }
};
