// Service to fetch token data from Defined.fi API
import { TokenPriceData, TokenVolumeData, TokenInfo } from '@/types/token';

// Base URL for the API
const API_BASE_URL = 'https://api.defined.fi';

// API key from the knowledge base
const API_KEY = '3fe52a290da2025bdddcc45a353c0268810eacf7';

// Token address on Polygon
const TOKEN_ADDRESS = '0xdcea55a12105335d1c2f8972f3b80965a7e07847';

/**
 * Fetches historical price data for a token
 * @returns Promise with price data array
 */
export const fetchTokenPriceHistory = async (): Promise<TokenPriceData[]> => {
  try {
    console.log('Fetching token price history with API key:', API_KEY ? 'API key present' : 'No API key');
    
    const response = await fetch(`${API_BASE_URL}/v0/token/${TOKEN_ADDRESS}/price_history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error ${response.status}:`, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Price history data received:', data);
    
    // Transform the API response to match our expected format
    return data.data.map((item: any) => ({
      date: new Date(item.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: item.price_usd
    }));
  } catch (error) {
    console.error('Error fetching token price history:', error);
    // Fall back to mock data if the API call fails
    return generateMockPriceData();
  }
};

/**
 * Fetches historical volume data for a token
 * @returns Promise with volume data array
 */
export const fetchTokenVolumeHistory = async (): Promise<TokenVolumeData[]> => {
  try {
    console.log('Fetching token volume history with API key:', API_KEY ? 'API key present' : 'No API key');
    
    const response = await fetch(`${API_BASE_URL}/v0/token/${TOKEN_ADDRESS}/volume_history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error ${response.status}:`, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Volume history data received:', data);
    
    // Transform the API response to match our expected format
    return data.data.map((item: any) => ({
      date: new Date(item.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: item.volume_usd
    }));
  } catch (error) {
    console.error('Error fetching token volume history:', error);
    // Fall back to mock data if the API call fails
    return generateMockVolumeData();
  }
};

/**
 * Fetches current token price
 * @returns Promise with current price
 */
export const fetchCurrentTokenPrice = async (): Promise<number> => {
  try {
    console.log('Fetching current token price with API key:', API_KEY ? 'API key present' : 'No API key');
    
    const response = await fetch(`${API_BASE_URL}/v0/token/${TOKEN_ADDRESS}/price`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error ${response.status}:`, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Current price data received:', data);
    
    // Return the current price
    return data.data.price_usd;
  } catch (error) {
    console.error('Error fetching current token price:', error);
    // Fall back to mock data if the API call fails
    return generateMockCurrentPrice();
  }
};

/**
 * Fetches token information like total supply and blockchain
 * @returns Promise with token info
 */
export const fetchTokenInfo = async (): Promise<TokenInfo> => {
  try {
    console.log('Fetching token info with API key:', API_KEY ? 'API key present' : 'No API key');
    
    const response = await fetch(`${API_BASE_URL}/v0/token/${TOKEN_ADDRESS}/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error ${response.status}:`, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Token info data received:', data);
    
    // Transform the API response to match our expected format
    return {
      totalSupply: data.data.total_supply.toLocaleString(),
      blockchain: "Polygon", // Or extract from API if available
      contractAddress: TOKEN_ADDRESS
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    // Fall back to mock data if the API call fails
    return {
      totalSupply: "100,000,000",
      blockchain: "Polygon",
      contractAddress: TOKEN_ADDRESS
    };
  }
};

// Mock data generators for fallback

/**
 * Generates mock price data
 */
const generateMockPriceData = (): TokenPriceData[] => {
  const today = new Date();
  return Array.from({ length: 10 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (9 - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Create some price movement (starting at 0.00012 with some variation)
    const basePrice = 0.00012;
    const randomFactor = 0.9 + (Math.random() * 0.2); // Between 0.9 and 1.1
    const trendFactor = 1 + (i * 0.015); // Slight upward trend
    
    return {
      date: dateStr,
      price: basePrice * randomFactor * trendFactor
    };
  });
};

/**
 * Generates mock volume data
 */
const generateMockVolumeData = (): TokenVolumeData[] => {
  const today = new Date();
  return Array.from({ length: 10 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (9 - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Create some volume data with variability
    const baseVolume = 25000;
    const randomFactor = 0.8 + (Math.random() * 0.4); // Between 0.8 and 1.2
    const trendFactor = 1 + (i * 0.02); // Slight upward trend
    
    return {
      date: dateStr,
      volume: Math.round(baseVolume * randomFactor * trendFactor)
    };
  });
};

/**
 * Generates mock current price
 */
const generateMockCurrentPrice = (): number => {
  return 0.00023 * (0.95 + Math.random() * 0.1);
};
