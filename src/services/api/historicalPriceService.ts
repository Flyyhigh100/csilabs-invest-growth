
import { TokenPriceData } from '@/types/token';
import { generateMockPriceData } from '../mocks/mockDataGenerators';
import { fetchDexScreenerHistorical } from './dexScreenerHistoricalService';

export const fetchTokenPriceHistory = async (): Promise<TokenPriceData[]> => {
  try {
    console.log('Fetching token price history from DexScreener');
    
    const priceData = await fetchDexScreenerHistorical();
    
    if (!priceData || priceData.length === 0) {
      console.warn('No historical price data received, using mock data');
      return generateMockPriceData();
    }

    // Validate the data range
    const prices = priceData.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    console.log('Price range validation:', { min, max, dataPoints: priceData.length });
    
    if (min <= 0 || max > 100) { // Sanity check for price range
      console.error('Price data outside expected range:', { min, max });
      return generateMockPriceData();
    }

    return priceData;
  } catch (error) {
    console.error('Error fetching token price history:', error);
    return generateMockPriceData();
  }
};
