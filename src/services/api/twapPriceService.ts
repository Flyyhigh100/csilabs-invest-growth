
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

// CSL token address (case-insensitive comparison)
const CSL = V3_TOKEN0.toLowerCase();
const USDC = V3_TOKEN1.toLowerCase();

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

      // Get actual token addresses from the pool to handle potential token ordering issues
      const token0Address = (await pool.token0()).toLowerCase();
      const token1Address = (await pool.token1()).toLowerCase();
      
      if (ENABLE_LOGGING) {
        console.log(`Pool token0: ${token0Address}, Our V3_TOKEN0: ${V3_TOKEN0.toLowerCase()}`);
        console.log(`Pool token1: ${token1Address}, Our V3_TOKEN1: ${V3_TOKEN1.toLowerCase()}`);
      }
      
      // Determine token ordering in the pool (which is token0 and which is token1)
      const cslIsToken0 = token0Address === CSL.toLowerCase();
      const usdcIsToken0 = token0Address === USDC.toLowerCase();
      
      if (!cslIsToken0 && !usdcIsToken0) {
        console.warn(`Token not found in pool: CSL=${CSL}, USDC=${USDC}, token0=${token0Address}, token1=${token1Address}`);
      }

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
      
      // Get the correct decimal values based on token positions
      const token0Decimals = cslIsToken0 ? V3_TOKEN0_DECIMALS : V3_TOKEN1_DECIMALS;
      const token1Decimals = cslIsToken0 ? V3_TOKEN1_DECIMALS : V3_TOKEN0_DECIMALS;
      
      // Calculate the decimal adjustment factor
      const decimalAdjustment = Math.pow(10, token1Decimals - token0Decimals);
      
      // Calculate final price with decimal adjustment
      let priceCslInUsd;
      
      if (cslIsToken0) {
        // If CSL is token0, price is token1 per token0, which means USDC per CSL
        priceCslInUsd = priceToken1PerToken0 * decimalAdjustment;
      } else {
        // If CSL is token1, price is 1/priceToken1PerToken0, which is 1/(USDC per CSL)
        priceCslInUsd = (1 / priceToken1PerToken0) * decimalAdjustment;
      }
      
      if (ENABLE_LOGGING) {
        console.log(`TWAP calculation complete: ${priceCslInUsd} ${COUNTER_TOKEN_SYMBOL} per CSL`);
        console.log(`Token positions: CSL is ${cslIsToken0 ? 'token0' : 'token1'}`);
        console.log(`Decimal adjustment: 10^(${token1Decimals} - ${token0Decimals}) = ${decimalAdjustment}`);
      }
      
      // Sanity check the price value to catch extremely large or small values
      if (priceCslInUsd > 1e10 || priceCslInUsd < 1e-10) {
        throw new Error(`Calculated price is out of reasonable range: ${priceCslInUsd}`);
      }
      
      // Validate price
      if (!isValidPrice(priceCslInUsd)) {
        throw new Error(`Invalid TWAP price: ${priceCslInUsd}`);
      }

      // Cache the valid price
      setCachedPrice(priceCslInUsd);
      
      return priceCslInUsd;
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
