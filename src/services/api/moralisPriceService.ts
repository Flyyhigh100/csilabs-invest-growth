
import { PRICE_CACHE_DURATION } from './config';
import { generateMockCurrentPrice } from '../mocks/mockDataGenerators';
import { getCachedPrice, setCachedPrice, invalidateCache } from './utils/priceCache';
import { isValidPrice } from './utils/priceValidation';
import { fetchUniswapTokenPrice } from './uniswapPriceService';
import { toast } from 'sonner';

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
    
    console.log('Fetching fresh token price from Uniswap API');
    const price = await fetchUniswapTokenPrice();
    
    if (!isValidPrice(price)) {
      console.error('Invalid price received from Uniswap:', price);
      throw new Error('Invalid price received from API');
    }
    
    console.log('New valid price received:', price);
    setCachedPrice(price);
    return price;
    
  } catch (error) {
    console.error('Error fetching token price:', error);
    
    // Show error toast to user
    toast.error('Failed to fetch current token price', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    
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
