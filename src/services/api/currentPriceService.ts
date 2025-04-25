
import { fetchUniswapTokenPrice } from './uniswapPriceService';

export const fetchCurrentTokenPrice = async (forceRefresh: boolean = false): Promise<number> => {
  return fetchUniswapTokenPrice();
};
