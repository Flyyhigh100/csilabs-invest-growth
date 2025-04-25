
import { TokenPriceData } from '@/types/token';
import { MORALIS_BASE_URL, MORALIS_CHAIN, TOKEN_ADDRESS, START_DATE, END_DATE, DAYS_TO_INCLUDE } from './config';
import { generateMockPriceData } from '../mocks/mockDataGenerators';
import { formatDate } from './utils/dateUtils';
import { supabase } from '@/integrations/supabase/client';

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

export const fetchTokenPriceHistory = async (): Promise<TokenPriceData[]> => {
  try {
    console.log('Fetching token price history from Defined.fi');
    console.log('Using token address:', TOKEN_ADDRESS);
    
    const apiKey = await getApiKey();

    const daysAgo = Math.floor((Date.now() / 1000 - START_DATE) / 86400);
    const url = `${MORALIS_BASE_URL}/erc20/${TOKEN_ADDRESS}/price/history?chain=${MORALIS_CHAIN}&days=${daysAgo}`;
    
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
      console.error('Defined.fi API error:', errorText);
      throw new Error(`Failed to fetch price history: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received historical price data points:', data.length);

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('No historical price data received, using mock data');
      return generateMockPriceData();
    }

    const formattedData: TokenPriceData[] = data
      .filter((item: any) => item.date && item.price)
      .map((item: any) => ({
        date: formatDate(new Date(item.date).getTime() / 1000),
        price: parseFloat(item.price)
      }))
      .filter(item => !isNaN(item.price) && item.price > 0)
      .slice(-DAYS_TO_INCLUDE); // Only keep the most recent days

    if (formattedData.length === 0) {
      console.warn('No valid price data after processing, using mock data');
      return generateMockPriceData();
    }

    return formattedData;
  } catch (error) {
    console.error('Error fetching token price history:', error);
    return generateMockPriceData();
  }
};
