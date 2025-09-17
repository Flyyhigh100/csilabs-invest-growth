
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

    // Validate the data
    if (!priceData.every(d => d.price > 0)) {
      console.error('Invalid price data detected');
      return generateMockPriceData();
    }

    console.log('Price data validation successful:', { 
      dataPoints: priceData.length,
      firstDate: priceData[0].date,
      lastDate: priceData[priceData.length - 1].date,
      lastPrice: priceData[priceData.length - 1].price
    });

    return priceData;
  } catch (error) {
    console.error('Error fetching token price history:', error);
    return generateMockPriceData();
  }
};
