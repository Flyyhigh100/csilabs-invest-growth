
import { TokenVolumeData } from '@/types/token';
import { MORALIS_BASE_URL, API_KEY, TOKEN_ADDRESS, MORALIS_CHAIN, START_DATE, END_DATE } from './config';
import { generateMockVolumeData } from '../mocks/mockDataGenerators';

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
    console.log('Fetching token volume history with API key:', API_KEY ? 'API key present' : 'No API key');
    
    // Use mock data if no API key is provided
    if (!API_KEY) {
      console.log('No API key provided, using mock volume data');
      return generateMockVolumeData();
    }
    
    // Use Moralis token transfers API to estimate volume
    // Calculate days from START_DATE
    const daysAgo = Math.floor((Date.now() / 1000 - START_DATE) / 86400);
    const url = `${MORALIS_BASE_URL}/erc20/${TOKEN_ADDRESS}/transfers?chain=${MORALIS_CHAIN}&from_date=${new Date(START_DATE * 1000).toISOString()}`;
    
    console.log('Fetching volume history from URL:', url);
    
    // Add a timeout to the fetch operation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': API_KEY
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Moralis API error ${response.status}:`, errorText);
      console.log('Using mock data as fallback due to API error');
      return generateMockVolumeData();
    }

    const data = await response.json();
    console.log('Token transfers data received:', data);
    
    // Process transfers into daily volume data
    // This is a simplified approach since we don't have direct volume data
    if (data.result && Array.isArray(data.result)) {
      console.log(`Received ${data.result.length} transfer records`);
      
      // Group transfers by day
      const dailyVolumes: Record<string, number> = {};
      
      data.result.forEach((transfer: any) => {
        const timestamp = new Date(transfer.block_timestamp).getTime() / 1000;
        const dateKey = formatDate(timestamp);
        
        // Convert value from wei to token units using the token decimals (usually 18)
        // This is a simple approximation for volume
        const value = parseInt(transfer.value) / 1e18;
        
        if (!dailyVolumes[dateKey]) {
          dailyVolumes[dateKey] = 0;
        }
        
        dailyVolumes[dateKey] += value;
      });
      
      // Convert to array format
      const volumeData = Object.entries(dailyVolumes).map(([date, volume]) => ({
        date,
        volume
      }));
      
      console.log(`Processed ${volumeData.length} volume data points`);
      
      if (volumeData.length > 0) {
        return volumeData.sort((a, b) => {
          // Sort by date
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
      }
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
