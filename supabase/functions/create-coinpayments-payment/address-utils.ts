
/**
 * Helper function to clean cryptocurrency payment addresses by removing any prefixes
 * This ensures wallet applications can properly scan the address
 */
export function cleanPaymentAddress(address: string): string {
  if (!address) return '';
  
  // Common patterns for prefixed addresses (e.g., 'btc:address', 'eth-network:address', etc.)
  const prefixPatterns = [
    /^[a-z]+-[a-z0-9]+:(0x[a-fA-F0-9]+)$/,  // Format: chain-network:0xaddress
    /^[a-z]+:(0x[a-fA-F0-9]+)$/,            // Format: chain:0xaddress
    /^[a-z]+-[a-z0-9]+:([a-zA-Z0-9]+)$/,    // Format: chain-network:address
    /^[a-z]+:([a-zA-Z0-9]+)$/               // Format: chain:address
  ];
  
  // Check each pattern and extract the clean address if match is found
  for (const pattern of prefixPatterns) {
    const match = address.match(pattern);
    if (match && match[1]) {
      console.log(`Cleaned payment address from ${address} to ${match[1]}`);
      return match[1];
    }
  }
  
  // If ethereum-style address with 0x prefix but has other prefixes
  if (address.includes('0x')) {
    const ethMatch = address.match(/.*?(0x[a-fA-F0-9]+)$/);
    if (ethMatch && ethMatch[1]) {
      console.log(`Extracted Ethereum address from ${address} to ${ethMatch[1]}`);
      return ethMatch[1];
    }
  }
  
  // For Bitcoin and similar addresses, remove any prefixes before the base58 or bech32 address
  const btcMatch = address.match(/.*?:([a-zA-Z0-9]+)$/);
  if (btcMatch && btcMatch[1]) {
    console.log(`Extracted Bitcoin-style address from ${address} to ${btcMatch[1]}`);
    return btcMatch[1];
  }
  
  // If no pattern matches, return the original address
  console.log(`No cleanup needed for address: ${address}`);
  return address;
}
