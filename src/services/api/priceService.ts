
import { TokenPriceData } from '@/types/token';
import { API_BASE_URL, API_KEY, TOKEN_ADDRESS, CHAIN_ID, TIME_RANGE, START_DATE, END_DATE, QUOTE_TOKEN, AGGREGATION_DAYS, DAYS_TO_INCLUDE } from './config';
import { generateMockPriceData, generateMockCurrentPrice } from '../mocks/mockDataGenerators';

/**
 * Formats a timestamp to a readable date
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string
 */
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  
  // For multi-year view, use month and year format
  return date.toLocaleDateString('en-US', { 
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Fetches historical price data for a token
 * @returns Promise with price data array
 */
export const fetchTokenPriceHistory = async (): Promise<TokenPriceData[]> => {
  try {
    console.log('Fetching token price history with API key:', API_KEY ? 'API key present' : 'No API key');
    console.log(`Fetching data from ${new Date(START_DATE * 1000).toLocaleDateString()} to ${new Date(END_DATE * 1000).toLocaleDateString()}`);
    
    // Build URL with all necessary parameters - explicitly include timeFrame parameter with days
    const url = `${API_BASE_URL}/v0/token/${CHAIN_ID}/${TOKEN_ADDRESS}/price_history?timeRange=${TIME_RANGE}&quoteToken=${QUOTE_TOKEN}&timeFrame=${DAYS_TO_INCLUDE}d`;
    console.log('Fetching price history from URL:', url);
    
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
    } else {
      console.warn('Unexpected price history data format:', data);
      console.log('Using mock data as fallback due to unexpected data format');
      return generateMockPriceData();
    }
  } catch (error) {
    console.error('Error fetching token price history:', error);
    console.log('Using mock data as fallback due to error');
    // Fall back to mock data if the API call fails
    return generateMockPriceData();
  }
};

/**
 * Fetches current token price
 * @returns Promise with current price
 */
export const fetchCurrentTokenPrice = async (): Promise<number> => {
  try {
    console.log('Fetching current token price');
    
    const url = `${API_BASE_URL}/v0/token/${CHAIN_ID}/${TOKEN_ADDRESS}/price?quoteToken=${QUOTE_TOKEN}`;
    
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
      return generateMockCurrentPrice();
    }

    const data = await response.json();
    
    // Return the current price
    if (data.data && typeof data.data.price_usd === 'number') {
      return data.data.price_usd;
    } else if (data.data && typeof data.data.price_usd === 'string') {
      return parseFloat(data.data.price_usd);
    } else {
      console.warn('Unexpected current price data format:', data);
      return generateMockCurrentPrice();
    }
  } catch (error) {
    console.error('Error fetching current token price:', error);
    return generateMockCurrentPrice();
  }
};
