
import { TokenPriceData, TokenVolumeData } from '@/types/token';

/**
 * Generates mock price data
 * @param multiYear Whether to generate multi-year data (from 2021)
 */
export const generateMockPriceData = (multiYear = false): TokenPriceData[] => {
  if (multiYear) {
    // Generate data from 2021 to present
    const startDate = new Date('2021-10-26');
    const endDate = new Date();
    const months = [];
    
    // Create monthly data points from start date to now
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      months.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months.map((date, index) => {
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short',
        year: 'numeric'
      });
      
      // Create a price pattern that starts low and grows over time
      const basePrice = 0.00006;
      const growthFactor = 1 + (index * 0.04); // Steady growth
      const volatility = 0.85 + (Math.random() * 0.3); // Add some randomness
      
      return {
        date: dateStr,
        price: basePrice * growthFactor * volatility
      };
    });
  } else {
    // Generate short-term data (last 30 days)
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (29 - i));
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
  }
};

/**
 * Generates mock volume data
 * @param multiYear Whether to generate multi-year data (from 2021)
 */
export const generateMockVolumeData = (multiYear = false): TokenVolumeData[] => {
  if (multiYear) {
    // Generate data from 2021 to present
    const startDate = new Date('2021-10-26');
    const endDate = new Date();
    const months = [];
    
    // Create monthly data points from start date to now
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      months.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months.map((date, index) => {
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short',
        year: 'numeric'
      });
      
      // Create volume data with growth over time and variability
      const baseVolume = 15000;
      const growthFactor = 1 + (index * 0.08); // Progressive growth
      const seasonality = 0.7 + (Math.random() * 0.6); // Add seasonality and randomness
      
      return {
        date: dateStr,
        volume: Math.round(baseVolume * growthFactor * seasonality)
      };
    });
  } else {
    // Generate short-term data (last 30 days)
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (29 - i));
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
  }
};

/**
 * Generates mock current price
 */
export const generateMockCurrentPrice = (): number => {
  return 0.00023 * (0.95 + Math.random() * 0.1);
};
