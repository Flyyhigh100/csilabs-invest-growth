
import { TokenInfo } from '@/types/token';
import { TOKEN_ADDRESS, UNISWAP_SUBGRAPH_URL } from './config';

/**
 * Fetches token information like total supply and blockchain
 * @returns Promise with token info
 */
export const fetchTokenInfo = async (): Promise<TokenInfo> => {
  try {
    console.log('Fetching token info from Uniswap Subgraph');
    
    const query = `{
      token(id: "${TOKEN_ADDRESS.toLowerCase()}") {
        name
        symbol
        decimals
        totalSupply
        totalLiquidity
        derivedETH
      }
    }`;
    
    const response = await fetch(UNISWAP_SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Uniswap Subgraph API error ${response.status}:`, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Token info data received:', data?.data?.token);
    
    if (!data?.data?.token) {
      throw new Error('No token data received');
    }
    
    const token = data.data.token;
    
    // Format total supply based on decimals
    const totalSupply = token.totalSupply && token.decimals ? 
      (parseInt(token.totalSupply) / Math.pow(10, parseInt(token.decimals))).toLocaleString() : 
      "100,000,000";
    
    return {
      totalSupply: totalSupply,
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
