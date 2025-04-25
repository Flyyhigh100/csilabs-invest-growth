
import { generateMockCurrentPrice } from '../mocks/mockDataGenerators';
import { getCachedPrice, setCachedPrice, PRICE_CACHE_DURATION } from './utils/priceCache';
import { fetchMoralisTokenPrice } from './moralisPriceService';

export const fetchCurrentTokenPrice = async (forceRefresh: boolean = false): Promise<number> => {
  return fetchMoralisTokenPrice(forceRefresh);
};
