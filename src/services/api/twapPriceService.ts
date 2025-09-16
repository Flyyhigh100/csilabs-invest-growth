
import { ethers } from 'ethers';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import { isValidPrice } from './utils/priceValidation';
import { makeRpcCall } from './proxyService';
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

// Debug flag
const DEBUG_TWAP = import.meta.env.VITE_DEBUG_TWAP === 'true';

// Configure retry mechanism
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Use proxy instead of direct RPC calls
const POLYGON_RPC_URL = import.meta.env.VITE_POLYGON_RPC || 'https://polygon-bor.publicnode.com/';
const WINDOW_SEC = Number(import.meta.env.VITE_TWAP_WINDOW) || 900; // 15 minutes by default

/**
 * Fetches Time-Weighted Average Price (TWAP) for CSL token from Uniswap V3
 * Uses proxy service to bypass network restrictions
 */
export async function fetchOnchainTwap(): Promise<number> {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      if (ENABLE_LOGGING || DEBUG_TWAP) {
        console.log(`Fetching on-chain TWAP from pool ${UNISWAP_V3_POOL} with window ${WINDOW_SEC}s via proxy`);
      }
      
      // Get actual token addresses from the pool to handle potential token ordering issues
      const token0Result = await makeRpcCall('eth_call', [
        {
          to: UNISWAP_V3_POOL,
          data: '0x0dfe1681' // token0() function selector
        },
        'latest'
      ], POLYGON_RPC_URL);
      
      const token1Result = await makeRpcCall('eth_call', [
        {
          to: UNISWAP_V3_POOL,
          data: '0xd21220a7' // token1() function selector
        },
        'latest'
      ], POLYGON_RPC_URL);
      
      // Ensure the results are strings and handle potential format issues
      const token0Address = typeof token0Result === 'string' ? token0Result.slice(-40) : '';
      const token1Address = typeof token1Result === 'string' ? token1Result.slice(-40) : '';
      
      if (!token0Address || !token1Address) {
        throw new Error('Failed to get valid token addresses from pool');
      }
      
      // Parse token addresses with ethers
      const parsedToken0 = ethers.utils.getAddress('0x' + token0Address).toLowerCase();
      const parsedToken1 = ethers.utils.getAddress('0x' + token1Address).toLowerCase();
      
      if (ENABLE_LOGGING || DEBUG_TWAP) {
        console.log(`Pool token0: ${parsedToken0}, Our V3_TOKEN0: ${V3_TOKEN0.toLowerCase()}`);
        console.log(`Pool token1: ${parsedToken1}, Our V3_TOKEN1: ${V3_TOKEN1.toLowerCase()}`);
      }
      
      // USDC and CSL token addresses (lowercase for case-insensitive comparison)
      const cslTokenAddress = V3_TOKEN1.toLowerCase(); // CSL token address
      const usdcTokenAddress = V3_TOKEN0.toLowerCase(); // USDC token address
      
      // Determine token ordering in the pool (which is token0 and which is token1)
      const cslIsToken0 = parsedToken0 === cslTokenAddress;
      const cslIsToken1 = parsedToken1 === cslTokenAddress;
      
      // Validate that one of our tokens is found in the pool
      if (!cslIsToken0 && !cslIsToken1) {
        console.warn(`CSL token not found in pool: CSL=${cslTokenAddress}, token0=${token0Address}, token1=${token1Address}`);
        throw new Error('Token configuration mismatch with pool');
      }

      // Get tick cumulatives from the pool using proxy
      const observeCalldata = ethers.utils.defaultAbiCoder.encode(
        ['uint32[]'],
        [[WINDOW_SEC, 0]]
      );
      
      const observeResult = await makeRpcCall('eth_call', [
        {
          to: UNISWAP_V3_POOL,
          data: '0x883bdbfd' + observeCalldata.slice(2) // observe() function selector + calldata
        },
        'latest'
      ], POLYGON_RPC_URL);
      
      // Decode the result
      const decodedResult = ethers.utils.defaultAbiCoder.decode(
        ['int56[]', 'uint160[]'],
        observeResult
      );
      
      const tickCumulatives = decodedResult[0];
      const tickAvg = tickCumulatives[1].sub(tickCumulatives[0]).div(WINDOW_SEC);
      
      if (ENABLE_LOGGING || DEBUG_TWAP) {
        console.log(`Raw tick average: ${tickAvg}`);
      }

      // Calculate raw price (token1 per token0)
      const priceToken1PerToken0 = Math.pow(1.0001, Number(tickAvg));
      
      // Get the correct decimal values based on token positions
      const token0Decimals = cslIsToken0 ? V3_TOKEN1_DECIMALS : V3_TOKEN0_DECIMALS;
      const token1Decimals = cslIsToken0 ? V3_TOKEN0_DECIMALS : V3_TOKEN1_DECIMALS;
      
      // Calculate the decimal adjustment factor (exponents flipped due to division)
      const decimalAdjustment = Math.pow(10, token0Decimals - token1Decimals);
      
      // Calculate final price with decimal adjustment
      let priceCslInUsd;
      
      if (cslIsToken0) {
        // If CSL is token0, price is 1/priceToken1PerToken0 (inverse of USDC per CSL)
        // We flip because we want CSL price in terms of USDC
        priceCslInUsd = (1 / priceToken1PerToken0) * decimalAdjustment;
      } else {
        // If CSL is token1, price is priceToken1PerToken0 (CSL per USDC)
        priceCslInUsd = priceToken1PerToken0 * decimalAdjustment;
      }
      
      if (ENABLE_LOGGING || DEBUG_TWAP) {
        console.log(`TWAP calculation complete: ${priceCslInUsd} ${COUNTER_TOKEN_SYMBOL} per CSL`);
        console.log(`Token positions: CSL is ${cslIsToken0 ? 'token0' : 'token1'}`);
        console.log(`Decimal adjustment: 10^(${token0Decimals} - ${token1Decimals}) = ${decimalAdjustment}`);
      }
      
      // Sanity check the price value to catch extremely large or small values
      if (priceCslInUsd > 10 || priceCslInUsd < 0.1) {
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
