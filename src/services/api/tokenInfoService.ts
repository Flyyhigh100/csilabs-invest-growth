
import { TokenInfo } from '@/types/token';
import { API_BASE_URL, API_KEY, TOKEN_ADDRESS, CHAIN_ID } from './config';

/**
 * Fetches token information like total supply and blockchain
 * @returns Promise with token info
 */
export const fetchTokenInfo = async (): Promise<TokenInfo> => {
  try {
    console.log('Fetching token info with API key:', API_KEY ? 'API key present' : 'No API key');
    
    const response = await fetch(`${API_BASE_URL}/v0/token/${CHAIN_ID}/${TOKEN_ADDRESS}/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error ${response.status}:`, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Token info data received:', data);
    
    // Transform the API response to match our expected format
    if (data.data) {
      return {
        totalSupply: data.data.total_supply ? data.data.total_supply.toLocaleString() : "100,000,000",
        blockchain: "Polygon",
        contractAddress: TOKEN_ADDRESS
      };
    } else {
      console.warn('Unexpected token info data format:', data);
      throw new Error('Unexpected data format');
    }
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
