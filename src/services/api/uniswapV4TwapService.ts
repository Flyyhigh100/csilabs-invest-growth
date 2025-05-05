import { ethers } from 'ethers';
import { UNISWAP_V4_URL, UNISWAP_V4_POOL, TOKEN_ADDRESS, ENABLE_LOGGING } from './config';
import { isValidPrice } from './utils/priceValidation';
import { setCachedPrice } from './utils/priceCache';

// Configuration for TWAP window (15 minutes, same as V3)
const WINDOW_SEC = Number(import.meta.env.VITE_TWAP_WINDOW) || 900;

// Constants for retry mechanisms
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Uniswap V4 Hooks Signatures (used to detect if pool has TWAP hooks)
const TWAP_HOOK_SIGNATURE = '0x4d71591a'; // Example signature, would need to be replaced with actual hook signature

/**
 * Interface for storing price data points for custom TWAP calculation
 */
interface PriceDataPoint {
  timestamp: number;
  price: number;
}

// In-memory cache of price data points for TWAP calculation
let priceDataPoints: PriceDataPoint[] = [];

// Maximum number of price points to keep in memory
const MAX_PRICE_POINTS = 20;

/**
 * Query the subgraph to check if the V4 pool has a TWAP hook
 * @returns boolean indicating if TWAP hook exists
 */
async function checkForTwapHook(): Promise<boolean> {
  try {
    if (ENABLE_LOGGING) {
      console.log(`Checking if V4 pool ${UNISWAP_V4_POOL} has TWAP hooks`);
    }
    
    // This is a simplified example - in reality, you would need to:
    // 1. Query the blockchain to check hooks installed on the pool
    // 2. Compare against known TWAP hook signatures
    
    // For now, we'll assume no hook exists as most pools don't have specialized TWAP hooks
    return false;
  } catch (error) {
    console.error("Error checking for V4 TWAP hooks:", error);
    return false;
  }
}

/**
 * Gets the latest V4 spot price and stores it for TWAP calculation
 */
async function collectPriceDataPoint(): Promise<number> {
  // Use the existing V4 price function to get spot price
  const { fetchUniswapV4Price } = await import('./uniswapV4PriceService');
  const currentPrice = await fetchUniswapV4Price();
  
  // Store the price with its timestamp
  const newDataPoint: PriceDataPoint = {
    timestamp: Math.floor(Date.now() / 1000),
    price: currentPrice
  };
  
  // Add to our sliding window of data points
  priceDataPoints.push(newDataPoint);
  
  // Keep only the most recent points for our window
  if (priceDataPoints.length > MAX_PRICE_POINTS) {
    priceDataPoints.shift();
  }
  
  if (ENABLE_LOGGING) {
    console.log(`Collected V4 price data point: ${currentPrice} at ${new Date().toISOString()}`);
    console.log(`Total data points: ${priceDataPoints.length}`);
  }
  
  return currentPrice;
}

/**
 * Calculate TWAP from stored price data points
 * Uses time-weighted average of collected price points over WINDOW_SEC period
 */
function calculateCustomTwap(): number | null {
  // Need at least 2 data points for TWAP
  if (priceDataPoints.length < 2) {
    return null;
  }
  
  const now = Math.floor(Date.now() / 1000);
  const earliestValidTime = now - WINDOW_SEC;
  
  // Filter to only include data points within our window
  const validPoints = priceDataPoints.filter(point => point.timestamp >= earliestValidTime);
  
  if (validPoints.length < 2) {
    return null;
  }
  
  // Sort by timestamp (oldest first)
  validPoints.sort((a, b) => a.timestamp - b.timestamp);
  
  let twap = 0;
  let totalWeight = 0;
  
  // Calculate time-weighted average
  for (let i = 1; i < validPoints.length; i++) {
    const prevPoint = validPoints[i-1];
    const currentPoint = validPoints[i];
    
    // Time between measurements becomes the weight
    const timeWeight = currentPoint.timestamp - prevPoint.timestamp;
    
    // Use average price during this interval
    const avgPrice = (prevPoint.price + currentPoint.price) / 2;
    
    // Add weighted contribution to TWAP
    twap += avgPrice * timeWeight;
    totalWeight += timeWeight;
  }
  
  // If we have meaningful weights, calculate final TWAP
  if (totalWeight > 0) {
    return twap / totalWeight;
  }
  
  return null;
}

/**
 * Fetch TWAP price from Uniswap V4 
 * First checks for a TWAP hook on the pool
 * If hook exists, use it - otherwise use custom implementation
 */
export async function fetchUniswapV4Twap(): Promise<number> {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      if (ENABLE_LOGGING) {
        console.log(`Fetching V4 TWAP with window ${WINDOW_SEC}s`);
      }
      
      // Check if we have a TWAP hook on our pool
      const hasTwapHook = await checkForTwapHook();
      let twapPrice: number | null = null;
      
      if (hasTwapHook) {
        if (ENABLE_LOGGING) {
          console.log('V4 pool has TWAP hook, using hook-based TWAP');
        }
        
        // Hook-based TWAP calculation would go here
        // This is placeholder code since we're assuming no hook exists
        throw new Error('TWAP hook approach not implemented yet');
        
      } else {
        if (ENABLE_LOGGING) {
          console.log('V4 pool has no TWAP hook, using custom TWAP calculation');
        }
        
        // Get the latest price data point
        await collectPriceDataPoint();
        
        // Calculate TWAP from stored data points
        twapPrice = calculateCustomTwap();
        
        // If we don't have enough data for TWAP yet, use latest price
        if (twapPrice === null) {
          if (ENABLE_LOGGING) {
            console.log('Not enough data for V4 TWAP calculation, using latest spot price');
          }
          
          if (priceDataPoints.length > 0) {
            twapPrice = priceDataPoints[priceDataPoints.length - 1].price;
          } else {
            throw new Error('No price data available for V4 TWAP calculation');
          }
        }
      }
      
      if (ENABLE_LOGGING) {
        console.log(`V4 TWAP calculation complete: ${twapPrice}`);
      }
      
      // Validate price
      if (!isValidPrice(twapPrice)) {
        throw new Error(`Invalid V4 TWAP price: ${twapPrice}`);
      }

      // Cache the valid price
      setCachedPrice(twapPrice);
      
      return twapPrice;
    } catch (error) {
      retries++;
      
      if (retries > MAX_RETRIES) {
        console.error('V4 TWAP fetching failed after max retries:', error);
        throw error;
      }
      
      console.warn(`V4 TWAP fetch attempt ${retries} failed, retrying in ${RETRY_DELAY}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
    }
  }

  throw new Error('V4 TWAP fetch failed after retries');
}

/**
 * Schedule regular price data collection for TWAP calculation
 * Call this function at application startup
 */
export function initializeV4TwapDataCollection(): void {
  // Collect initial data point
  collectPriceDataPoint()
    .catch(err => console.error('Failed to collect initial V4 price data point:', err));
  
  // Schedule regular collection (every 2 minutes)
  const collectionInterval = 2 * 60 * 1000; // 2 minutes
  
  setInterval(() => {
    collectPriceDataPoint()
      .catch(err => console.error('Failed to collect V4 price data point:', err));
  }, collectionInterval);
  
  if (ENABLE_LOGGING) {
    console.log(`Initialized V4 TWAP data collection with ${collectionInterval / 1000}s interval`);
  }
}
