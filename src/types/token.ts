
// Types for token price and volume data

export interface TokenPriceData {
  date: string;
  price: number;
}

export interface TokenVolumeData {
  date: string;
  volume: number;
}

export interface TokenInfo {
  totalSupply: string;
  blockchain: string;
  contractAddress: string;
}
