
import { TokenInfo } from '@/types/token';

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
