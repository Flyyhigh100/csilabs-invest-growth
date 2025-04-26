
import { TokenPriceData } from '@/types/token';
import { generateMockPriceData } from '../mocks/mockDataGenerators';
import { fetchDexScreenerHistorical } from './dexScreenerHistoricalService';

/**
 * Fetches historical price data from DexScreener
 */
export const fetchTokenPriceHistory = async (): Promise<TokenPriceData[]> => {
  try {
    console.log('Fetching token price history from DexScreener');
    
    const priceData = await fetchDexScreenerHistorical();
    
    if (!priceData || priceData.length === 0) {
      console.warn('No historical price data received, using mock data');
      return generateMockPriceData();
    }

    return priceData;
  } catch (error) {
    console.error('Error fetching token price history:', error);
    return generateMockPriceData();
  }
};
