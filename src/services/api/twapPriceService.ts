
import { ethers } from 'ethers';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import { isValidPrice } from './utils/priceValidation';
import { ENABLE_LOGGING, TOKEN_ADDRESS, COUNTER_TOKEN_SYMBOL } from './config';
import { setCachedPrice } from './utils/priceCache';

const provider = new ethers.providers.JsonRpcProvider(import.meta.env.VITE_POLYGON_RPC || 'https://polygon-rpc.com');
const poolAddr = (import.meta.env.VITE_V3_POOL as string)?.toLowerCase() || '0x03f8fe849404dca3ae3e16ac4ff0b240dbc139f4';
const WINDOW_SEC = Number(import.meta.env.VITE_TWAP_WINDOW) || 900; // 15 minutes by default

// CSL token address
const CSL = TOKEN_ADDRESS.toLowerCase();

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

      // Calculate raw price (token1 per token0, which is CSL per USDC/USDT)
      const priceToken1PerToken0 = Math.pow(1.0001, Number(tickAvg));
      
      // Determine token ordering and invert if CSL is token1 (which it should be based on address ordering)
      const token0 = (await pool.token0()).toLowerCase();
      
      // Get token decimals to normalize the price
      const token0Decimals = token0 === CSL ? 18 : 6; // USDC/USDT has 6 decimals, CSL has 18
      const token1Decimals = token0 === CSL ? 6 : 18;
      
      // Calculate the decimal adjustment factor
      const decimalAdjustment = Math.pow(10, token1Decimals - token0Decimals);
      
      // Calculate final price with decimal adjustment
      let priceCslInStablecoin;
      if (token0 === CSL) {
        // If CSL is token0 (unlikely in this case)
        priceCslInStablecoin = priceToken1PerToken0 * decimalAdjustment;
      } else {
        // If CSL is token1 (which is our case) - invert the price
        priceCslInStablecoin = (1 / priceToken1PerToken0) * decimalAdjustment;
      }
      
      if (ENABLE_LOGGING) {
        console.log(`TWAP price calculation complete: ${priceCslInStablecoin} ${COUNTER_TOKEN_SYMBOL} per CSL`);
        console.log(`Token0: ${token0}, CSL is ${token0 === CSL ? 'token0' : 'token1'}`);
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
      
      console.warn(`TWAP fetch attempt ${retries} failed, retrying in ${RETRY_DELAY}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
    }
  }

  throw new Error('TWAP fetch failed after retries');
}
