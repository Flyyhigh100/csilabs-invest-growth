
import { TokenVolumeData } from '@/types/token';
import { API_BASE_URL, API_KEY, TOKEN_ADDRESS, CHAIN_ID, TIME_RANGE, START_DATE } from './config';
import { generateMockVolumeData } from '../mocks/mockDataGenerators';

/**
 * Formats a timestamp to a readable date
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string
 */
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  
  // For annual view, use month and year format
  return date.toLocaleDateString('en-US', { 
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Fetches historical volume data for a token
 * @returns Promise with volume data array
 */
export const fetchTokenVolumeHistory = async (): Promise<TokenVolumeData[]> => {
  try {
    console.log('Fetching token volume history with API key:', API_KEY ? 'API key present' : 'No API key');
    
    // Ensure we're getting all available data with 'all' time range
    const url = `${API_BASE_URL}/v0/token/${CHAIN_ID}/${TOKEN_ADDRESS}/volume_history?timeRange=${TIME_RANGE}`;
    console.log('Fetching volume history from URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error ${response.status}:`, errorText);
      console.log('Using mock data as fallback due to API error');
      return generateMockVolumeData(true);
    }

    const data = await response.json();
    console.log('Volume history data received, status:', data.status);
    console.log('Data points received:', data.data ? data.data.length : 0);
    
    // Transform the API response to match our expected format
    if (data.data && Array.isArray(data.data)) {
      // Log sample data point
      if (data.data.length > 0) {
        console.log('Sample data point:', data.data[0]);
      }
      
      // Filter data to only include records since START_DATE
      const filteredData = data.data.filter((item: any) => 
        item.timestamp >= START_DATE
      );
      
      console.log(`Filtered ${filteredData.length} data points since ${new Date(START_DATE * 1000).toISOString()}`);
      
      if (filteredData.length === 0) {
        console.warn('No volume data found since START_DATE, using mock data');
        return generateMockVolumeData(true);
      }
      
      // Group data by month for annual view
      const monthlyData: { [key: string]: { volumes: number[], timestamp: number } } = {};
      
      filteredData.forEach((item: any) => {
        const timestamp = item.timestamp;
        const formattedDate = formatDate(timestamp);
        
        if (!monthlyData[formattedDate]) {
          monthlyData[formattedDate] = {
            volumes: [],
            timestamp: timestamp
          };
        }
        
        monthlyData[formattedDate].volumes.push(parseFloat(item.volume_usd) || 0);
      });
      
      // Calculate total volume for each month
      const result = Object.entries(monthlyData)
        .map(([date, data]) => ({
          date,
          volume: data.volumes.reduce((sum, volume) => sum + volume, 0)
        }))
        .sort((a, b) => {
          // Sort by timestamp from oldest to newest
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
      
      console.log(`Processed ${result.length} monthly data points`);
      console.log('First data point:', result[0]);
      console.log('Last data point:', result[result.length - 1]);
      
      return result;
    } else {
      console.warn('Unexpected volume history data format:', data);
      console.log('Raw volume data received:', JSON.stringify(data));
      console.log('Using mock data as fallback due to unexpected data format');
      return generateMockVolumeData(true);
    }
  } catch (error) {
    console.error('Error fetching token volume history:', error);
    console.log('Using mock data as fallback due to error');
    // Fall back to mock data if the API call fails
    return generateMockVolumeData(true);
  }
};
