
import { MORALIS_BASE_URL, MORALIS_CHAIN, TOKEN_ADDRESS } from './config';
import { generateMockCurrentPrice } from '../mocks/mockDataGenerators';
import { getCachedPrice, setCachedPrice, PRICE_CACHE_DURATION } from './utils/priceCache';
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

export const fetchMoralisTokenPrice = async (forceRefresh: boolean = false): Promise<number> => {
  try {
    // Check cache first if not forcing refresh
    const cachedCurrentPrice = getCachedPrice();
    if (!forceRefresh && cachedCurrentPrice && 
        (Date.now() - cachedCurrentPrice.timestamp) < PRICE_CACHE_DURATION) {
      console.log('Using cached price:', cachedCurrentPrice.price);
      return cachedCurrentPrice.price;
    }
    
    console.log(`Fetching token price from Moralis for ${TOKEN_ADDRESS} on chain ${MORALIS_CHAIN}`);
    
    const url = `${MORALIS_BASE_URL}/erc20/${TOKEN_ADDRESS}/price?chain=${MORALIS_CHAIN}`;
    console.log('Fetching price from Moralis URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': process.env.MORALIS_API_KEY || ''
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Moralis API error ${response.status}:`, errorText);
      
      const cachedPrice = getCachedPrice();
      if (cachedPrice) {
        console.log('API error, using last cached price:', cachedPrice.price);
        return cachedPrice.price;
      }
      
      const mockPrice = generateMockCurrentPrice();
      setCachedPrice(mockPrice);
      return mockPrice;
    }

    const data: MoralisTokenPriceResponse = await response.json();
    console.log('Moralis API Response:', data);
    
    const price = data.usdPrice;
    
    if (isValidPrice(price)) {
      setCachedPrice(price);
      console.log('New price cached:', price);
      return price;
    } else {
      console.warn('Received invalid price from Moralis:', price);
      const cachedPrice = getCachedPrice();
      if (cachedPrice) {
        return cachedPrice.price;
      }
      const fallbackPrice = generateMockCurrentPrice();
      setCachedPrice(fallbackPrice);
      return fallbackPrice;
    }
  } catch (error) {
    console.error('Error fetching token price from Moralis:', error);
    console.error('Token:', TOKEN_ADDRESS);
    console.error('Chain:', MORALIS_CHAIN);
    
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
