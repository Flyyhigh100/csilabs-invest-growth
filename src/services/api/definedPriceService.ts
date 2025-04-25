
import { TOKEN_ADDRESS, CHAIN_ID } from './config';
import { supabase } from '@/integrations/supabase/client';
import { getCachedPrice, setCachedPrice, PRICE_CACHE_DURATION } from './utils/priceCache';

export const fetchDefinedTokenPrice = async (tokenAddress: string = TOKEN_ADDRESS): Promise<number> => {
  try {
    // Check if we have a cached price that's still valid
    const cachedPrice = getCachedPrice();
    if (cachedPrice && Date.now() - cachedPrice.timestamp < PRICE_CACHE_DURATION) {
      console.log('Using cached price:', cachedPrice.price);
      return cachedPrice.price;
    }
    
    console.log('Calling get-token-price function for', tokenAddress);
    
    // Call our Supabase edge function
    const { data, error } = await supabase.functions.invoke('get-token-price', {
      body: { 
        tokenAddress, 
        chainId: CHAIN_ID 
      }
    });
    
    // Check for errors
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to fetch price: ${error.message}`);
    }
    
    if (!data || !data.price) {
      console.error('Invalid response from price function:', data);
      throw new Error('Invalid price data returned');
    }
    
    // Store in cache and return the price
    console.log('New price received:', data.price);
    setCachedPrice(data.price);
    return data.price;
  } catch (error) {
    console.error('Error fetching price from Defined.fi:', error);
    
    // If we have a cached price, return it even if expired as fallback
    const cachedPrice = getCachedPrice();
    if (cachedPrice) {
      console.log('Falling back to cached price due to error:', cachedPrice.price);
      return cachedPrice.price;
    }
    
    throw error;
  }
};
