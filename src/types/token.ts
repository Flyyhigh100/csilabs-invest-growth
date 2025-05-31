
// Types for token price and volume data

export interface TokenPriceData {
  date: string;
  price: number;
}

export interface TokenVolumeData {
  date: string;
  volume: number;
}

export interface BlockchainContract {
  name: string;
  contractAddress: string;
}

export interface TokenInfo {
  totalSupply: string;
  blockchains: BlockchainContract[];
}
