
// Service to fetch token data from Defined.fi API
import { TokenPriceData, TokenVolumeData, TokenInfo } from '@/types/token';

// Base URL for the API
const API_BASE_URL = 'https://api.defined.fi';

// API key (in a real app, this should be in an environment variable or fetched securely)
const API_KEY = 'YOUR_DEFINED_FI_API_KEY'; // Replace with your actual Defined.fi API key

// Token address on Polygon
const TOKEN_ADDRESS = '0xdcea55a12105335d1c2f8972f3b80965a7e07847';

/**
 * Fetches historical price data for a token
 * @returns Promise with price data array
 */
export const fetchTokenPriceHistory = async (): Promise<TokenPriceData[]> => {
  try {
    // For demonstration purposes, if no API key is provided, fall back to mock data
    if (!API_KEY || API_KEY === 'YOUR_DEFINED_FI_API_KEY') {
      console.warn('Using mock price data. Replace API_KEY with a real key for production.');
      return generateMockPriceData();
    }

    const response = await fetch(`${API_BASE_URL}/v0/token/${TOKEN_ADDRESS}/price_history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the API response to match our expected format
    // Note: You'll need to adjust this based on the actual API response structure
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
    // For demonstration purposes, if no API key is provided, fall back to mock data
    if (!API_KEY || API_KEY === 'YOUR_DEFINED_FI_API_KEY') {
      console.warn('Using mock volume data. Replace API_KEY with a real key for production.');
      return generateMockVolumeData();
    }

    const response = await fetch(`${API_BASE_URL}/v0/token/${TOKEN_ADDRESS}/volume_history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the API response to match our expected format
    // Note: You'll need to adjust this based on the actual API response structure
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
    // For demonstration purposes, if no API key is provided, fall back to mock data
    if (!API_KEY || API_KEY === 'YOUR_DEFINED_FI_API_KEY') {
      console.warn('Using mock current price. Replace API_KEY with a real key for production.');
      return generateMockCurrentPrice();
    }

    const response = await fetch(`${API_BASE_URL}/v0/token/${TOKEN_ADDRESS}/price`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the current price
    // Note: You'll need to adjust this based on the actual API response structure
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
    // For demonstration purposes, if no API key is provided, fall back to mock data
    if (!API_KEY || API_KEY === 'YOUR_DEFINED_FI_API_KEY') {
      console.warn('Using mock token info. Replace API_KEY with a real key for production.');
      return {
        totalSupply: "100,000,000",
        blockchain: "Polygon",
        contractAddress: TOKEN_ADDRESS
      };
    }

    const response = await fetch(`${API_BASE_URL}/v0/token/${TOKEN_ADDRESS}/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the API response to match our expected format
    // Note: You'll need to adjust this based on the actual API response structure
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
