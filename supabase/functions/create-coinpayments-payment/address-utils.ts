
/**
 * Clean cryptocurrency payment address by removing prefixes like "ethereum:".
 * This ensures that addresses are consistently formatted for display and use.
 */
export function cleanPaymentAddress(address: string): string {
  if (!address) return '';
  
  // Remove any protocol prefix like ethereum:, bitcoin:, etc.
  const cleanedAddress = address.replace(/^[a-z]+:/, '');
  
  // For Ethereum addresses (including BNB on BSC which uses the Ethereum format)
  if (/^(0x)?[0-9a-fA-F]{40}$/.test(cleanedAddress)) {
    console.log(`Extracted Ethereum address from ${address} to ${cleanedAddress}`);
    return cleanedAddress;
  }
  
  // For other formats, just return the cleaned address
  return cleanedAddress;
}
