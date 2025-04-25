
import { MORALIS_BASE_URL, MORALIS_CHAIN, TOKEN_ADDRESS } from './config';
import { generateMockCurrentPrice } from '../mocks/mockDataGenerators';
import { getCachedPrice, setCachedPrice, PRICE_CACHE_DURATION, invalidateCache } from './utils/priceCache';
import { isValidPrice } from './utils/priceValidation';

interface MoralisTokenPriceResponse {
  nativePrice: {
    value: string;
    decimals: number;
    name: string;
    symbol: string;
  };
  usdPrice: number;
  exchangeAddress: string;
  exchangeName: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok && retries > 0) {
      console.log(`Retry attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retry attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES} after error:`, error);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export const fetchMoralisTokenPrice = async (forceRefresh: boolean = false): Promise<number> => {
  try {
    const cachedCurrentPrice = getCachedPrice();
    if (!forceRefresh && cachedCurrentPrice && 
        (Date.now() - cachedCurrentPrice.timestamp) < PRICE_CACHE_DURATION) {
      console.log('Using cached price:', cachedCurrentPrice.price);
      return cachedCurrentPrice.price;
    }

    const moralisApiKey = process.env.MORALIS_API_KEY;
    if (!moralisApiKey) {
      console.error('Moralis API key not found');
      throw new Error('Moralis API key not configured');
    }
    
    console.log(`Fetching fresh token price for ${TOKEN_ADDRESS} on chain ${MORALIS_CHAIN}`);
    
    const url = `${MORALIS_BASE_URL}/erc20/${TOKEN_ADDRESS}/price?chain=${MORALIS_CHAIN}`;
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': moralisApiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Moralis API error ${response.status}:`, errorText);
      throw new Error(`Moralis API error: ${response.status}`);
    }

    const data: MoralisTokenPriceResponse = await response.json();
    console.log('Moralis API Response:', data);
    
    const price = data.usdPrice;
    
    if (!isValidPrice(price)) {
      console.error('Invalid price received from Moralis:', price);
      throw new Error('Invalid price received from API');
    }
    
    // Only cache if the price is valid
    setCachedPrice(price);
    console.log('New price cached:', price);
    return price;
    
  } catch (error) {
    console.error('Error fetching token price from Moralis:', error);
    console.error('Token:', TOKEN_ADDRESS);
    console.error('Chain:', MORALIS_CHAIN);
    
    // Invalidate cache on error to prevent stale data
    invalidateCache();
    
    const cachedPrice = getCachedPrice();
    if (cachedPrice) {
      console.log('Using last known good price:', cachedPrice.price);
      return cachedPrice.price;
    }
    
    console.log('Falling back to mock price');
    const mockPrice = generateMockCurrentPrice();
    setCachedPrice(mockPrice);
    return mockPrice;
  }
};
