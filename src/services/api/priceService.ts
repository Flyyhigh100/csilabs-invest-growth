import { TokenPriceData } from '@/types/token';
import { API_BASE_URL, API_KEY, TOKEN_ADDRESS, CHAIN_ID, TIME_RANGE, START_DATE, END_DATE, QUOTE_TOKEN, AGGREGATION_DAYS, DAYS_TO_INCLUDE } from './config';
import { generateMockPriceData, generateMockCurrentPrice } from '../mocks/mockDataGenerators';

// Cache mechanism for current price
let cachedCurrentPrice: { price: number; timestamp: number } | null = null;
const PRICE_CACHE_DURATION = 30000; // 30 seconds cache

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
 * Validates if a price is reasonable (not too high or too low)
 * @param price The price to validate
 * @returns Boolean indicating if price is valid
 */
const isValidPrice = (price: number): boolean => {
  // Allow for micro-priced tokens (8 decimal places)
  const MIN_ACCEPTABLE_PRICE = 0.00000001;
  const MAX_ACCEPTABLE_PRICE = 100;  // Maximum price cap for sanity check
  
  return price >= MIN_ACCEPTABLE_PRICE && price <= MAX_ACCEPTABLE_PRICE;
};

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
    
    // Build URL with all necessary parameters - explicitly include timeFrame parameter with days
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
 * Fetches current token price with caching mechanism
 * @param forceRefresh Whether to bypass cache and force a fresh fetch
 * @returns Promise with current price
 */
export const fetchCurrentTokenPrice = async (forceRefresh: boolean = false): Promise<number> => {
  try {
    // Check cache first if not forcing refresh
    if (!forceRefresh && cachedCurrentPrice && 
        (Date.now() - cachedCurrentPrice.timestamp) < PRICE_CACHE_DURATION) {
      console.log('Using cached price:', cachedCurrentPrice.price);
      return cachedCurrentPrice.price;
    }
    
    console.log(`Fetching current token price for ${TOKEN_ADDRESS} on chain ${CHAIN_ID}`);
    
    // Use mock data if no API key is provided
    if (!API_KEY) {
      console.error('No API key provided for Defined.fi');
      const mockPrice = generateMockCurrentPrice();
      cachedCurrentPrice = { price: mockPrice, timestamp: Date.now() };
      return mockPrice;
    }
    
    const url = `${API_BASE_URL}/v0/token/${CHAIN_ID}/${TOKEN_ADDRESS}/price?quoteToken=${QUOTE_TOKEN}`;
    console.log('Fetching price from URL:', url);
    
    // Add a timeout to the fetch operation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
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
      console.error('Token:', TOKEN_ADDRESS);
      console.error('Chain:', CHAIN_ID);
      
      if (response.status === 401 || response.status === 403) {
        console.error('API key authentication failed. Please verify your Defined.fi API key.');
      }
      
      if (cachedCurrentPrice) {
        console.log('API error, using last cached price:', cachedCurrentPrice.price);
        return cachedCurrentPrice.price;
      }
      
      const mockPrice = generateMockCurrentPrice();
      cachedCurrentPrice = { price: mockPrice, timestamp: Date.now() };
      return mockPrice;
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    let currentPrice: number;
    
    if (data.data && typeof data.data.price_usd === 'number') {
      currentPrice = data.data.price_usd;
    } else if (data.data && typeof data.data.price_usd === 'string') {
      currentPrice = parseFloat(data.data.price_usd);
    } else {
      console.warn('Unexpected price data format:', data);
      if (cachedCurrentPrice) {
        return cachedCurrentPrice.price;
      }
      currentPrice = generateMockCurrentPrice();
    }
    
    // Always cache valid prices
    if (!isNaN(currentPrice) && currentPrice > 0) {
      cachedCurrentPrice = { price: currentPrice, timestamp: Date.now() };
      console.log('New price cached:', currentPrice);
      return currentPrice;
    } else {
      console.warn('Received invalid price:', currentPrice);
      if (cachedCurrentPrice) {
        console.log('Using last valid cached price instead');
        return cachedCurrentPrice.price;
      }
      const fallbackPrice = generateMockCurrentPrice();
      cachedCurrentPrice = { price: fallbackPrice, timestamp: Date.now() };
      return fallbackPrice;
    }
  } catch (error) {
    console.error('Error fetching current token price:', error);
    console.error('Token:', TOKEN_ADDRESS);
    console.error('Chain:', CHAIN_ID);
    
    if (cachedCurrentPrice) {
      console.log('Error occurred, using last cached price:', cachedCurrentPrice.price);
      return cachedCurrentPrice.price;
    }
    const fallbackPrice = generateMockCurrentPrice();
    cachedCurrentPrice = { price: fallbackPrice, timestamp: Date.now() };
    return fallbackPrice;
  }
};

/**
 * Gets the time remaining until the next price refresh
 * @returns Time in milliseconds until next refresh or 0 if cache is expired
 */
export const getTimeUntilNextPriceRefresh = (): number => {
  if (!cachedCurrentPrice) return 0;
  
  const elapsed = Date.now() - cachedCurrentPrice.timestamp;
  if (elapsed >= PRICE_CACHE_DURATION) return 0;
  
  return PRICE_CACHE_DURATION - elapsed;
};

/**
 * Gets the timestamp of when the price was last updated
 * @returns Timestamp or null if no price has been fetched
 */
export const getPriceLastUpdatedTime = (): number | null => {
  return cachedCurrentPrice ? cachedCurrentPrice.timestamp : null;
};

/**
 * Converts USD value to token amount using current price
 * @param usdAmount USD amount to convert
 * @param tokenPrice Current token price (optional, will fetch if not provided)
 * @returns Promise with token amount
 */
export const convertUsdToTokenAmount = async (usdAmount: number, tokenPrice?: number): Promise<number> => {
  const price = tokenPrice || await fetchCurrentTokenPrice();
  if (price <= 0) return 0;
  return usdAmount / price;
};

/**
 * Converts token amount to USD value using current price
 * @param tokenAmount Token amount to convert
 * @param tokenPrice Current token price (optional, will fetch if not provided)
 * @returns Promise with USD amount
 */
export const convertTokenAmountToUsd = async (tokenAmount: number, tokenPrice?: number): Promise<number> => {
  const price = tokenPrice || await fetchCurrentTokenPrice();
  return tokenAmount * price;
};
