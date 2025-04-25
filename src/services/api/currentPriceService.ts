
import { API_BASE_URL, API_KEY, TOKEN_ADDRESS, CHAIN_ID, QUOTE_TOKEN } from './config';
import { generateMockCurrentPrice } from '../mocks/mockDataGenerators';
import { getCachedPrice, setCachedPrice, PRICE_CACHE_DURATION } from './utils/priceCache';

/**
 * Fetches current token price with caching mechanism
 * @param forceRefresh Whether to bypass cache and force a fresh fetch
 * @returns Promise with current price
 */
export const fetchCurrentTokenPrice = async (forceRefresh: boolean = false): Promise<number> => {
  try {
    // Check cache first if not forcing refresh
    const cachedCurrentPrice = getCachedPrice();
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
      setCachedPrice(mockPrice);
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
      
      const cachedPrice = getCachedPrice();
      if (cachedPrice) {
        console.log('API error, using last cached price:', cachedPrice.price);
        return cachedPrice.price;
      }
      
      const mockPrice = generateMockCurrentPrice();
      setCachedPrice(mockPrice);
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
      const cachedPrice = getCachedPrice();
      if (cachedPrice) {
        return cachedPrice.price;
      }
      currentPrice = generateMockCurrentPrice();
    }
    
    // Always cache valid prices
    if (!isNaN(currentPrice) && currentPrice > 0) {
      setCachedPrice(currentPrice);
      console.log('New price cached:', currentPrice);
      return currentPrice;
    } else {
      console.warn('Received invalid price:', currentPrice);
      const cachedPrice = getCachedPrice();
      if (cachedPrice) {
        console.log('Using last valid cached price instead');
        return cachedPrice.price;
      }
      const fallbackPrice = generateMockCurrentPrice();
      setCachedPrice(fallbackPrice);
      return fallbackPrice;
    }
  } catch (error) {
    console.error('Error fetching current token price:', error);
    console.error('Token:', TOKEN_ADDRESS);
    console.error('Chain:', CHAIN_ID);
    
    const cachedPrice = getCachedPrice();
    if (cachedPrice) {
      console.log('Error occurred, using last cached price:', cachedPrice.price);
      return cachedPrice.price;
    }
    const fallbackPrice = generateMockCurrentPrice();
    setCachedPrice(fallbackPrice);
    return fallbackPrice;
  }
};
