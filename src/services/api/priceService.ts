
import { TokenPriceData } from '@/types/token';
import { API_BASE_URL, API_KEY, TOKEN_ADDRESS, CHAIN_ID, TIME_RANGE, START_DATE, AGGREGATION_DAYS } from './config';
import { generateMockPriceData, generateMockCurrentPrice } from '../mocks/mockDataGenerators';

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
 * Fetches historical price data for a token
 * @returns Promise with price data array
 */
export const fetchTokenPriceHistory = async (): Promise<TokenPriceData[]> => {
  try {
    console.log('Fetching token price history with API key:', API_KEY ? 'API key present' : 'No API key');
    
    // Ensure we're getting all available data with 'all' time range
    const url = `${API_BASE_URL}/v0/token/${CHAIN_ID}/${TOKEN_ADDRESS}/price_history?timeRange=${TIME_RANGE}`;
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
      
      // Filter data to only include records since START_DATE
      const filteredData = data.data.filter((item: any) => 
        item.timestamp >= START_DATE
      );
      
      console.log(`Filtered ${filteredData.length} data points since ${new Date(START_DATE * 1000).toISOString()}`);
      
      if (filteredData.length === 0) {
        console.warn('No price data found since START_DATE, using mock data');
        return generateMockPriceData();
      }
      
      // Process the data based on the AGGREGATION_DAYS setting
      if (AGGREGATION_DAYS > 1) {
        // Group data by month for annual view
        const monthlyData: { [key: string]: { prices: number[], timestamp: number } } = {};
        
        filteredData.forEach((item: any) => {
          const timestamp = item.timestamp;
          const formattedDate = formatDate(timestamp);
          
          if (!monthlyData[formattedDate]) {
            monthlyData[formattedDate] = {
              prices: [],
              timestamp: timestamp
            };
          }
          
          // Ensure we're using the actual price from the API
          if (item.price_usd) {
            const price = typeof item.price_usd === 'string' 
              ? parseFloat(item.price_usd) 
              : item.price_usd;
              
            if (!isNaN(price) && price > 0) {
              monthlyData[formattedDate].prices.push(price);
            }
          }
        });
        
        // Calculate average price for each month
        const result = Object.entries(monthlyData)
          .map(([date, data]) => ({
            date,
            price: data.prices.length > 0 
              ? data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length
              : 0
          }))
          .filter(item => item.price > 0) // Filter out zero prices
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
            const price = typeof item.price_usd === 'string' 
              ? parseFloat(item.price_usd) 
              : item.price_usd;
              
            return {
              date: formatDate(item.timestamp),
              price: price
            };
          })
          .filter(item => !isNaN(item.price) && item.price > 0) // Filter out invalid prices
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
      console.warn('Unexpected price history data format:', data);
      console.log('Raw data received:', JSON.stringify(data));
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
    console.log('Fetching current token price with API key:', API_KEY ? 'API key present' : 'No API key');
    
    const url = `${API_BASE_URL}/v0/token/${CHAIN_ID}/${TOKEN_ADDRESS}/price`;
    console.log('Fetching current price from URL:', url);
    
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
      return generateMockCurrentPrice();
    }

    const data = await response.json();
    console.log('Current price data received:', data);
    
    // Return the current price
    if (data.data && typeof data.data.price_usd === 'number') {
      return data.data.price_usd;
    } else if (data.data && typeof data.data.price_usd === 'string') {
      return parseFloat(data.data.price_usd);
    } else {
      console.warn('Unexpected current price data format:', data);
      console.log('Raw price data received:', JSON.stringify(data));
      console.log('Using mock data as fallback due to unexpected data format');
      return generateMockCurrentPrice();
    }
  } catch (error) {
    console.error('Error fetching current token price:', error);
    console.log('Using mock data as fallback due to error');
    // Fall back to mock data if the API call fails
    return generateMockCurrentPrice();
  }
};
