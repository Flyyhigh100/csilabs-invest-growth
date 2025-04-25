
import { TokenPriceData } from '@/types/token';
import { API_BASE_URL, API_KEY, TOKEN_ADDRESS, CHAIN_ID, TIME_RANGE, START_DATE, END_DATE, QUOTE_TOKEN, DAYS_TO_INCLUDE } from './config';
import { generateMockPriceData } from '../mocks/mockDataGenerators';
import { formatDate } from './utils/dateUtils';

/**
 * Fetches historical price data for a token
 * @returns Promise with price data array
 */
export const fetchTokenPriceHistory = async (): Promise<TokenPriceData[]> => {
  try {
    // Log API request details for debugging
    console.log('Fetching token price history with API key:', API_KEY ? 'API key present' : 'No API key');
    console.log(`Fetching data from ${new Date(START_DATE * 1000).toLocaleDateString()} to ${new Date(END_DATE * 1000).toLocaleDateString()}`);
    
    // Use mock data if no API key is provided
    if (!API_KEY) {
      console.log('No API key provided, using mock data');
      return generateMockPriceData();
    }
    
    // Build URL with all necessary parameters
    const url = `${API_BASE_URL}/v0/token/${CHAIN_ID}/${TOKEN_ADDRESS}/price_history?timeRange=${TIME_RANGE}&quoteToken=${QUOTE_TOKEN}&timeFrame=${DAYS_TO_INCLUDE}d`;
    console.log('Fetching price history from URL:', url);
    
    // Add a timeout to the fetch operation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error ${response.status}:`, errorText);
      console.log('Using mock data as fallback due to API error');
      return generateMockPriceData();
    }

    const data = await response.json();
    console.log('Price history data received, status:', data.status);
    console.log('Data points received:', data.data ? data.data.length : 0);
    
    // Transform the API response to match our expected format
    if (data.data && Array.isArray(data.data)) {
      // Log sample data point
      if (data.data.length > 0) {
        console.log('Sample data point:', data.data[0]);
      }
      
      // Ensure we filter data between START_DATE and END_DATE
      const filteredData = data.data.filter((item: any) => 
        item.timestamp >= START_DATE && item.timestamp <= END_DATE
      );
      
      console.log(`Filtered ${filteredData.length} data points between ${new Date(START_DATE * 1000).toLocaleDateString()} and ${new Date(END_DATE * 1000).toLocaleDateString()}`);
      
      if (filteredData.length === 0) {
        console.warn('No price data found in specified date range, using mock data');
        return generateMockPriceData();
      }
      
      // Process all data points individually with no aggregation for maximum detail
      const result = filteredData
        .map((item: any) => {
          const price = typeof item.price_usd === 'string' 
            ? parseFloat(item.price_usd) 
            : (typeof item.price_usd === 'number' ? item.price_usd : 0);
            
          return {
            date: formatDate(item.timestamp),
            price: price
          };
        })
        .filter(item => !isNaN(item.price) && item.price > 0); // Filter out invalid prices
      
      console.log(`Processed ${result.length} data points`);
      if (result.length > 0) {
        console.log('First data point:', result[0]);
        console.log('Last data point:', result[result.length - 1]);
      }
      
      return result;
    }
    
    console.warn('Unexpected price history data format:', data);
    console.log('Using mock data as fallback due to unexpected data format');
    return generateMockPriceData();
  } catch (error) {
    console.error('Error fetching token price history:', error);
    console.log('Using mock data as fallback due to error');
    return generateMockPriceData();
  }
};
