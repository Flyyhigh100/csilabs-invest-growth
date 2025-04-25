
import { TokenPriceData } from '@/types/token';
import { TOKEN_ADDRESS, START_DATE, END_DATE, DAYS_TO_INCLUDE, UNISWAP_SUBGRAPH_URL } from './config';
import { generateMockPriceData } from '../mocks/mockDataGenerators';
import { formatDate } from './utils/dateUtils';

/**
 * Fetches historical price data from Uniswap's Subgraph API
 */
export const fetchTokenPriceHistory = async (): Promise<TokenPriceData[]> => {
  try {
    console.log('Fetching token price history from Uniswap Subgraph');
    console.log('Using token address:', TOKEN_ADDRESS);
    
    // Uniswap V2 subgraph doesn't have a direct daily price history endpoint
    // We'll need to query token day data or swap events
    // For simplicity, this example uses a basic query that gets current price
    // In a production app, you'd want to implement a more sophisticated query
    // that gets historical price points
    
    // This query attempts to get daily snapshots if available
    const query = `{
      tokenDayDatas(
        first: ${DAYS_TO_INCLUDE}
        orderBy: date
        orderDirection: desc
        where: { 
          token: "${TOKEN_ADDRESS.toLowerCase()}"
        }
      ) {
        date
        priceUSD
        totalLiquidityUSD
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
      console.error('Uniswap Subgraph API error:', errorText);
      throw new Error(`Failed to fetch price history: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received historical price data points:', data?.data?.tokenDayDatas?.length || 0);

    if (!data?.data?.tokenDayDatas || data.data.tokenDayDatas.length === 0) {
      console.warn('No historical price data received, using mock data');
      return generateMockPriceData();
    }

    // Process the data
    const formattedData: TokenPriceData[] = data.data.tokenDayDatas
      .filter((item: any) => item.date && item.priceUSD)
      .map((item: any) => ({
        date: formatDate(parseInt(item.date)),
        price: parseFloat(item.priceUSD)
      }))
      .filter((item: TokenPriceData) => !isNaN(item.price) && item.price > 0);
      
    // Sort data from oldest to newest
    formattedData.sort((a: TokenPriceData, b: TokenPriceData) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    if (formattedData.length === 0) {
      console.warn('No valid price data after processing, using mock data');
      return generateMockPriceData();
    }

    return formattedData;
  } catch (error) {
    console.error('Error fetching token price history:', error);
    return generateMockPriceData();
  }
};
