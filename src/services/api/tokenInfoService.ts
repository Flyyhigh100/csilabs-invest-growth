
import { TokenInfo } from '@/types/token';
import { MORALIS_BASE_URL, API_KEY, TOKEN_ADDRESS, MORALIS_CHAIN } from './config';

/**
 * Fetches token information like total supply and blockchain
 * @returns Promise with token info
 */
export const fetchTokenInfo = async (): Promise<TokenInfo> => {
  try {
    console.log('Fetching token info with API key:', API_KEY ? 'API key present' : 'No API key');
    
    // Use Moralis API instead of the old API
    const url = `${MORALIS_BASE_URL}/erc20/${TOKEN_ADDRESS}?chain=${MORALIS_CHAIN}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Moralis API error ${response.status}:`, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Token info data received:', data);
    
    // Transform the Moralis response to match our expected format
    return {
      totalSupply: data.totalSupply ? 
        (parseInt(data.totalSupply) / Math.pow(10, parseInt(data.decimals))).toLocaleString() : 
        "100,000,000",
      blockchain: "Polygon",
      contractAddress: TOKEN_ADDRESS
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    // Fall back to mock data if the API call fails
    return {
      totalSupply: "100,000,000",
      blockchain: "Polygon",
      contractAddress: TOKEN_ADDRESS
    };
  }
};
