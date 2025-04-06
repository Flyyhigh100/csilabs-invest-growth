import { TokenPriceData, TokenVolumeData } from '@/types/token';

/**
 * Generates mock price data
 * @param multiYear Whether to generate multi-year data (from 2021)
 */
export const generateMockPriceData = (multiYear = false): TokenPriceData[] => {
  // Always use recent data (matching the screenshot)
  // Generate data from March 2024 to present
  const startDate = new Date('2024-03-01');
  const endDate = new Date();
  const days = [];
  
  // Create daily data points from start date to now
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Get the number of days
  const totalDays = days.length;
  
  return days.map((date, index) => {
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric'
    });
    
    // Create a price pattern that starts low and grows over time
    // Using values similar to the screenshot (around $0.00022)
    const basePrice = 0.00013; // Starting price
    
    // Apply a growth trend with some fluctuations
    // This creates an upward trend with some randomness
    const dayProgress = index / totalDays;
    const trendFactor = 1 + (dayProgress * 0.7); // Overall growth factor
    
    // Add variability that increases over time
    const variabilityRange = 0.05 + (dayProgress * 0.15); // More volatility as time goes on
    const randomVariability = 1 - variabilityRange + (Math.random() * variabilityRange * 2);
    
    // Add some small periodic fluctuations (market cycles)
    const periodicFluctuation = Math.sin(index / 7) * 0.02; // Weekly pattern
    
    // Calculate final price
    const price = basePrice * trendFactor * randomVariability * (1 + periodicFluctuation);
    
    // Apply a big bump near the end to match the screenshot's final uptick
    const isNearEnd = index > totalDays * 0.9;
    const endBump = isNearEnd ? 1 + ((index - (totalDays * 0.9)) / (totalDays * 0.1)) * 0.2 : 1;
    
    return {
      date: dateStr,
      price: price * endBump
    };
  });
};

/**
 * Generates mock volume data
 * @param multiYear Whether to generate multi-year data (from 2021)
 */
export const generateMockVolumeData = (multiYear = false): TokenVolumeData[] => {
  // Always use recent data (matching the screenshot)
  // Generate data from March 2024 to present
  const startDate = new Date('2024-03-01');
  const endDate = new Date();
  const days = [];
  
  // Create daily data points from start date to now
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Get the number of days
  const totalDays = days.length;
  
  return days.map((date, index) => {
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric'
    });
    
    // Create volume data with variability
    // Average daily volume around the $30,000-$70,000 range
    const baseVolume = 40000;
    
    // Apply some randomness to daily volume
    const dailyRandomness = 0.5 + Math.random();
    
    // Add some periodic patterns (weekly cycles)
    const dayOfWeek = date.getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0; // Lower volume on weekends
    
    // Create occasional volume spikes
    const isVolumeSpike = Math.random() < 0.1; // 10% chance of a volume spike
    const spikeFactor = isVolumeSpike ? 1.5 + Math.random() * 1.5 : 1.0;
    
    // Volume tends to increase somewhat with price
    const trendFactor = 1 + (index / totalDays * 0.3);
    
    return {
      date: dateStr,
      volume: Math.round(baseVolume * dailyRandomness * weekendFactor * spikeFactor * trendFactor)
    };
  });
};

/**
 * Generates mock current price
 */
export const generateMockCurrentPrice = (): number => {
  // Match the price shown in the screenshot ($0.00022)
  return 0.00022 * (0.98 + Math.random() * 0.04);
};
