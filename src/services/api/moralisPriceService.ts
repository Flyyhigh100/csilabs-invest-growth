
import { MORALIS_BASE_URL, MORALIS_CHAIN, TOKEN_ADDRESS, PRICE_CACHE_DURATION } from './config';
import { generateMockCurrentPrice } from '../mocks/mockDataGenerators';
import { getCachedPrice, setCachedPrice, invalidateCache } from './utils/priceCache';
import { isValidPrice } from './utils/priceValidation';
import { supabase } from '@/integrations/supabase/client';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function getApiKey(): Promise<string> {
  try {
    // Standardize on using rpc call
    const { data, error } = await supabase
      .rpc('get_secret', { secret_name: 'MORALIS_API_KEY' });

    if (error || !data) {
      console.error('Failed to fetch Defined.fi API key:', error);
      throw new Error('API key not configured');
    }

    return data;
  } catch (error) {
    console.error('Error fetching API key:', error);
    throw new Error('Failed to fetch API key');
  }
}

async function fetchWithRetry(url: string, apiKey: string, retries = MAX_RETRIES): Promise<Response> {
  try {
    console.log('Fetching price from Defined.fi:', new Date().toISOString());
    console.log('Request URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Defined.fi API error ${response.status}:`, errorText);
      
      if (retries > 0 && response.status !== 401) { // Don't retry on auth errors
        console.log(`Retry attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, apiKey, retries - 1);
      }
      
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retry attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES} after error:`, error);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, apiKey, retries - 1);
    }
    throw error;
  }
}

export const fetchMoralisTokenPrice = async (forceRefresh: boolean = false): Promise<number> => {
  try {
    // Clear any existing cache if force refresh
    if (forceRefresh) {
      console.log('Force refreshing price cache');
      invalidateCache();
    }

    // Check cache first
    const cachedCurrentPrice = getCachedPrice();
    if (!forceRefresh && cachedCurrentPrice) {
      const timeSinceLastUpdate = Date.now() - cachedCurrentPrice.timestamp;
      console.log(`Cache age: ${timeSinceLastUpdate}ms`);
      
      if (timeSinceLastUpdate < PRICE_CACHE_DURATION) {
        console.log('Using cached price:', cachedCurrentPrice.price);
        return cachedCurrentPrice.price;
      }
    }
    
    // Get API key - will throw error if not configured
    const apiKey = await getApiKey();
    
    const url = `${MORALIS_BASE_URL}/erc20/${TOKEN_ADDRESS}/price?chain=${MORALIS_CHAIN}`;
    console.log('Fetching fresh token price from URL:', url);
    console.log('Using token address:', TOKEN_ADDRESS);
    
    const response = await fetchWithRetry(url, apiKey);
    const data = await response.json();
    
    console.log('Defined.fi API Response:', data);
    
    const price = data.usdPrice;
    
    if (!isValidPrice(price)) {
      console.error('Invalid price received from Defined.fi:', price);
      throw new Error('Invalid price received from API');
    }
    
    console.log('New valid price received:', price);
    setCachedPrice(price);
    return price;
    
  } catch (error) {
    console.error('Error fetching token price from Defined.fi:', error);
    
    // Invalidate cache on error to prevent stale data
    invalidateCache();
    
    // Try to use last known good price from cache
    const cachedPrice = getCachedPrice();
    if (cachedPrice) {
      console.log('Using last known good price:', cachedPrice.price);
      return cachedPrice.price;
    }
    
    console.log('No valid price available, using mock data');
    const mockPrice = generateMockCurrentPrice();
    setCachedPrice(mockPrice);
    return mockPrice;
  }
};
