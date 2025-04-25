
import { fetchMoralisTokenPrice } from './moralisPriceService';

export const fetchCurrentTokenPrice = async (forceRefresh: boolean = false): Promise<number> => {
  return fetchMoralisTokenPrice(forceRefresh);
};
