
import { generateMockVolumeData } from '../mocks/mockDataGenerators';
import { TokenVolumeData } from '@/types/token';
import { 
  TOKEN_ADDRESS, 
  UNISWAP_SUBGRAPH_URL, 
  START_DATE, 
  END_DATE 
} from './config';

/**
 * Formats a timestamp to a readable date
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string
 */
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  
  // For recent data, use month and day format (Apr 15)
  return date.toLocaleDateString('en-US', { 
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Fetches historical volume data for a token
 * @returns Promise with volume data array
 */
export const fetchTokenVolumeHistory = async (): Promise<TokenVolumeData[]> => {
  try {
    // Log API request details for debugging
    console.log('Fetching token volume history from Uniswap Subgraph');
    
    try {
      // Use Uniswap Subgraph to get swap volume
      const daysToFetch = Math.floor((Date.now() / 1000 - START_DATE) / 86400);
      const query = `{
        tokenDayDatas(
          first: ${Math.min(daysToFetch, 100)}
          orderBy: date
          orderDirection: desc
          where: { token: "${TOKEN_ADDRESS.toLowerCase()}" }
        ) {
          date
          dailyVolumeUSD
          totalLiquidityUSD
        }
      }`;
      
      console.log('Fetching volume history with query:', query);
      
      // Add a timeout to the fetch operation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(UNISWAP_SUBGRAPH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Uniswap Subgraph API error ${response.status}:`, errorText);
        console.log('Using mock data as fallback due to API error');
        return generateMockVolumeData();
      }

      const data = await response.json();
      console.log('Token volume data received:', data?.data?.tokenDayDatas?.length || 0);
      
      // Process data into daily volume
      if (data?.data?.tokenDayDatas && Array.isArray(data.data.tokenDayDatas) && data.data.tokenDayDatas.length > 0) {
        console.log(`Received ${data.data.tokenDayDatas.length} volume records`);
        
        // Convert to array format
        const volumeData = data.data.tokenDayDatas
          .filter((day: any) => day.date && day.dailyVolumeUSD)
          .map((day: any) => ({
            date: formatDate(parseInt(day.date)),
            volume: parseFloat(day.dailyVolumeUSD)
          }))
          .filter((item: TokenVolumeData) => !isNaN(item.volume) && item.volume > 0);
        
        console.log(`Processed ${volumeData.length} volume data points`);
        
        if (volumeData.length > 0) {
          return volumeData.sort((a: TokenVolumeData, b: TokenVolumeData) => {
            // Sort by date
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
          });
        }
      }
    } catch (error) {
      console.error('API request failed:', error);
    }
    
    console.log('No valid volume data processed, using mock data');
    return generateMockVolumeData();
  } catch (error) {
    console.error('Error fetching token volume history:', error);
    console.log('Using mock data as fallback due to error');
    // Fall back to mock data if the API call fails
    return generateMockVolumeData();
  }
};
