import { TokenInfo } from '@/types/token';
import { MORALIS_BASE_URL, TOKEN_ADDRESS, MORALIS_CHAIN } from './config';
import { supabase } from '@/integrations/supabase/client';

async function getApiKey(): Promise<string> {
  try {
    const { data, error } = await supabase
      .rpc('get_secret', { secret_name: 'MORALIS_API_KEY' });

    if (error || !data) {
      console.error('Failed to fetch Moralis API key:', error);
      throw new Error('API key not configured');
    }

    return data;
  } catch (error) {
    console.error('Error fetching API key:', error);
    throw new Error('Failed to fetch API key');
  }
}

/**
 * Fetches token information like total supply and blockchain
 * @returns Promise with token info
 */
export const fetchTokenInfo = async (): Promise<TokenInfo> => {
  try {
    console.log('Fetching token info');
    
    const apiKey = await getApiKey();
    
    // Use Moralis API instead of the old API
    const url = `${MORALIS_BASE_URL}/erc20/${TOKEN_ADDRESS}?chain=${MORALIS_CHAIN}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey
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
