
import { ethers } from 'ethers';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import { isValidPrice } from './utils/priceValidation';
import { 
  ENABLE_LOGGING, 
  UNISWAP_V3_POOL, 
  V3_TOKEN0, 
  V3_TOKEN1, 
  V3_TOKEN0_DECIMALS, 
  V3_TOKEN1_DECIMALS, 
  COUNTER_TOKEN_SYMBOL 
} from './config';
import { setCachedPrice } from './utils/priceCache';

const provider = new ethers.providers.JsonRpcProvider(import.meta.env.VITE_POLYGON_RPC || 'https://polygon-rpc.com');
const poolAddr = UNISWAP_V3_POOL;
const WINDOW_SEC = Number(import.meta.env.VITE_TWAP_WINDOW) || 900; // 15 minutes by default

// CSL token address
const CSL = V3_TOKEN0.toLowerCase();

// Configure retry mechanism
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Fetches Time-Weighted Average Price (TWAP) for CSL token from Uniswap V3
 * Uses on-chain data from the V3 pool for better accuracy
 */
export async function fetchOnchainTwap(): Promise<number> {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      if (ENABLE_LOGGING) {
        console.log(`Fetching on-chain TWAP from pool ${poolAddr} with window ${WINDOW_SEC}s`);
      }
      
      // Create contract instance
      const pool = new ethers.Contract(poolAddr, IUniswapV3PoolABI.abi, provider);

      // Get tick cumulatives from the pool
      // tickCumulatives[0] = cumulative tick WINDOW_SEC seconds ago
      // tickCumulatives[1] = current cumulative tick
      const [tickCumulatives] = await pool.observe([WINDOW_SEC, 0]);
      const tickAvg = (tickCumulatives[1].sub(tickCumulatives[0])).div(WINDOW_SEC);
      
      if (ENABLE_LOGGING) {
        console.log(`Raw tick average: ${tickAvg}`);
      }

      // Calculate raw price (token1 per token0)
      const priceToken1PerToken0 = Math.pow(1.0001, Number(tickAvg));
      
      // Verify token ordering from the pool
      const token0Address = (await pool.token0()).toLowerCase();
      const token1Address = (await pool.token1()).toLowerCase();
      
      if (ENABLE_LOGGING) {
        console.log(`Pool token0: ${token0Address}, Our V3_TOKEN0: ${V3_TOKEN0}`);
        console.log(`Pool token1: ${token1Address}, Our V3_TOKEN1: ${V3_TOKEN1}`);
      }
      
      // Calculate the decimal adjustment factor based on actual pool tokens
      const token0Decimals = token0Address === CSL ? V3_TOKEN0_DECIMALS : V3_TOKEN1_DECIMALS; 
      const token1Decimals = token0Address === CSL ? V3_TOKEN1_DECIMALS : V3_TOKEN0_DECIMALS;
      
      const decimalAdjustment = Math.pow(10, token1Decimals - token0Decimals);
      
      // Calculate final price with decimal adjustment
      let priceCslInStablecoin;
      if (token0Address === CSL) {
        // If CSL is token0, price is (1/priceToken1PerToken0) adjusted for decimals
        priceCslInStablecoin = (1 / priceToken1PerToken0) * decimalAdjustment;
      } else {
        // If CSL is token1, price is just priceToken1PerToken0 adjusted for decimals
        priceCslInStablecoin = priceToken1PerToken0 * decimalAdjustment;
      }
      
      if (ENABLE_LOGGING) {
        console.log(`TWAP price calculation complete: ${priceCslInStablecoin} ${COUNTER_TOKEN_SYMBOL} per CSL`);
        console.log(`Token0: ${token0Address}, CSL is ${token0Address === CSL ? 'token0' : 'token1'}`);
        console.log(`Decimal adjustment: 10^(${token1Decimals} - ${token0Decimals}) = ${decimalAdjustment}`);
      }
      
      // Validate price
      if (!isValidPrice(priceCslInStablecoin)) {
        throw new Error(`Invalid TWAP price: ${priceCslInStablecoin}`);
      }

      // Cache the valid price
      setCachedPrice(priceCslInStablecoin);
      
      return priceCslInStablecoin;
    } catch (error) {
      retries++;
      
      if (retries > MAX_RETRIES) {
        console.error('TWAP fetching failed after max retries:', error);
        throw error;
      }
      
      console.warn(`TWAP fetch attempt ${retries} failed, retrying in ${RETRY_DELAY * retries}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
    }
  }

  throw new Error('TWAP fetch failed after retries');
}
