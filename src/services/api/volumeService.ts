
import { TokenVolumeData } from '@/types/token';
import { API_BASE_URL, API_KEY, TOKEN_ADDRESS, CHAIN_ID, TIME_RANGE, START_DATE, END_DATE, QUOTE_TOKEN, AGGREGATION_DAYS } from './config';
import { generateMockVolumeData } from '../mocks/mockDataGenerators';

/**
 * Formats a timestamp to a readable date
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string
 */
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  
  // For time series view, use month and year format
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
    
    // Build URL with all necessary parameters
    const url = `${API_BASE_URL}/v0/token/${CHAIN_ID}/${TOKEN_ADDRESS}/volume_history?timeRange=${TIME_RANGE}&quoteToken=${QUOTE_TOKEN}`;
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
      return generateMockVolumeData();
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
      
      // Filter data to only include records between START_DATE and END_DATE
      const filteredData = data.data.filter((item: any) => 
        item.timestamp >= START_DATE && item.timestamp <= END_DATE
      );
      
      console.log(`Filtered ${filteredData.length} data points between ${new Date(START_DATE * 1000).toISOString()} and ${new Date(END_DATE * 1000).toISOString()}`);
      
      if (filteredData.length === 0) {
        console.warn('No volume data found in specified date range, using mock data');
        return generateMockVolumeData();
      }
      
      // Process the data based on the AGGREGATION_DAYS setting
      if (AGGREGATION_DAYS > 1) {
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
          
          // Ensure we're using the actual volume from the API
          const volume = typeof item.volume_usd === 'string' 
            ? parseFloat(item.volume_usd) 
            : (typeof item.volume_usd === 'number' ? item.volume_usd : 0);
              
          if (!isNaN(volume) && volume > 0) {
            monthlyData[formattedDate].volumes.push(volume);
          }
        });
        
        // Calculate total volume for each month
        const result = Object.entries(monthlyData)
          .map(([date, data]) => ({
            date,
            volume: data.volumes.length > 0 
              ? data.volumes.reduce((sum, volume) => sum + volume, 0)
              : 0
          }))
          .filter(item => item.volume > 0) // Filter out zero volumes
          .sort((a, b) => {
            // Sort by timestamp from oldest to newest
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
          });
        
        console.log(`Processed ${result.length} monthly data points`);
        if (result.length > 0) {
          console.log('First data point:', result[0]);
          console.log('Last data point:', result[result.length - 1]);
        }
        
        return result;
      } else {
        // Use daily data (no aggregation)
        const result = filteredData
          .map((item: any) => {
            const volume = typeof item.volume_usd === 'string' 
              ? parseFloat(item.volume_usd) 
              : (typeof item.volume_usd === 'number' ? item.volume_usd : 0);
              
            return {
              date: formatDate(item.timestamp),
              volume: volume
            };
          })
          .filter(item => !isNaN(item.volume) && item.volume > 0) // Filter out invalid volumes
          .sort((a, b) => {
            // Sort by date from oldest to newest
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
          });
          
        console.log(`Processed ${result.length} daily data points`);
        if (result.length > 0) {
          console.log('First data point:', result[0]);
          console.log('Last data point:', result[result.length - 1]);
        }
        
        return result;
      }
    } else {
      console.warn('Unexpected volume history data format:', data);
      console.log('Raw volume data received:', JSON.stringify(data));
      console.log('Using mock data as fallback due to unexpected data format');
      return generateMockVolumeData();
    }
  } catch (error) {
    console.error('Error fetching token volume history:', error);
    console.log('Using mock data as fallback due to error');
    // Fall back to mock data if the API call fails
    return generateMockVolumeData();
  }
};
