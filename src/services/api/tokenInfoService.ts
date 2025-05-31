
import { TokenInfo } from '@/types/token';

const TOKEN_ADDRESS = "0xcba5ca199bca0af3f6046da01169035f2c6a7ff0";
const SOLANA_ADDRESS = "3iU6Upm7bSx7VYFLfxsTGP1qmPCy6A7v6ddkmeNQtLqD";

/**
 * Fetches token information like total supply and blockchain contracts
 * @returns Promise with token info
 */
export const fetchTokenInfo = async (): Promise<TokenInfo> => {
  try {
    console.log('Fetching token info from multiple blockchains');
    
    // For now, return static data with both blockchain contracts
    // In the future, this could be enhanced to fetch real data from multiple sources
    
    return {
      totalSupply: "100,000,000",
      blockchains: [
        {
          name: "Polygon",
          contractAddress: TOKEN_ADDRESS
        },
        {
          name: "Solana",
          contractAddress: SOLANA_ADDRESS
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    // Fall back to static data if the API call fails
    return {
      totalSupply: "100,000,000", 
      blockchains: [
        {
          name: "Polygon",
          contractAddress: TOKEN_ADDRESS
        },
        {
          name: "Solana",
          contractAddress: SOLANA_ADDRESS
        }
      ]
    };
  }
};
