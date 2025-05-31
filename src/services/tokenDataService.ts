
import { TokenInfo, TokenPriceData, TokenVolumeData } from '@/types/token';

/**
 * Fetches token information including contracts on multiple blockchains
 * @returns Promise with token info
 */
export const fetchTokenInfo = async (): Promise<TokenInfo> => {
  try {
    console.log('Fetching token info with multi-blockchain support');
    
    // Return token info with both Polygon and Solana contracts
    return {
      totalSupply: "100,000,000",
      blockchains: [
        {
          name: "Polygon",
          contractAddress: "0xcba5ca199bca0af3f6046da01169035f2c6a7ff0"
        },
        {
          name: "Solana", 
          contractAddress: "3iU6Upm7bSx7VYFLfxsTGP1qmPCy6A7v6ddkmeNQtLqD"
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    // Fall back to default data if there's an error
    return {
      totalSupply: "100,000,000",
      blockchains: [
        {
          name: "Polygon",
          contractAddress: "0xcba5ca199bca0af3f6046da01169035f2c6a7ff0"
        },
        {
          name: "Solana",
          contractAddress: "3iU6Upm7bSx7VYFLfxsTGP1qmPCy6A7v6ddkmeNQtLqD"
        }
      ]
    };
  }
};

/**
 * Fetches token price history data
 * @returns Promise with price history data
 */
export const fetchTokenPriceHistory = async (): Promise<TokenPriceData[]> => {
  try {
    console.log('Fetching token price history');
    
    // Generate mock data for demonstration
    const mockData: TokenPriceData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic price data around $0.01
      const basePrice = 0.01;
      const variation = Math.random() * 0.002 - 0.001; // +/- 10% variation
      const price = Math.max(0, basePrice + variation);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        price: Number(price.toFixed(8))
      });
    }
    
    return mockData;
  } catch (error) {
    console.error('Error fetching price history:', error);
    return [];
  }
};

/**
 * Fetches token volume history data
 * @returns Promise with volume history data
 */
export const fetchTokenVolumeHistory = async (): Promise<TokenVolumeData[]> => {
  try {
    console.log('Fetching token volume history');
    
    // Generate mock data for demonstration
    const mockData: TokenVolumeData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic volume data
      const baseVolume = 50000;
      const variation = Math.random() * 40000; // 0 to 40k variation
      const volume = Math.max(0, baseVolume + variation);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        volume: Math.round(volume)
      });
    }
    
    return mockData;
  } catch (error) {
    console.error('Error fetching volume history:', error);
    return [];
  }
};
