
import { TokenPriceData, TokenVolumeData } from '@/types/token';

/**
 * Generates mock price data
 */
export const generateMockPriceData = (): TokenPriceData[] => {
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
};

/**
 * Generates mock volume data
 */
export const generateMockVolumeData = (): TokenVolumeData[] => {
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
};

/**
 * Generates mock current price
 */
export const generateMockCurrentPrice = (): number => {
  return 0.00023 * (0.95 + Math.random() * 0.1);
};
