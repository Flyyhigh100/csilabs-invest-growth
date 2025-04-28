
// Script to verify TWAP functionality
const { ethers } = require('ethers');
const IUniswapV3PoolABI = require('@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json');

// Configuration (same as in our service)
const provider = new ethers.providers.JsonRpcProvider(process.env.VITE_POLYGON_RPC || 'https://polygon-rpc.com');
const poolAddr = (process.env.VITE_V3_POOL || '0x03f8fe849404dca3ae3e16ac4ff0b240dbc139f4').toLowerCase();
const WINDOW_SEC = Number(process.env.VITE_TWAP_WINDOW) || 900;
const CSL = '0xcba5ca199bca0af3f6046da01169035f2c6a7ff0'.toLowerCase();

async function checkTwap() {
  try {
    console.log('Checking TWAP for CSL token...');
    console.log(`Pool Address: ${poolAddr}`);
    console.log(`Time Window: ${WINDOW_SEC} seconds`);
    
    const pool = new ethers.Contract(poolAddr, IUniswapV3PoolABI.abi, provider);
    
    // Get token info
    const token0 = (await pool.token0()).toLowerCase();
    const token1 = (await pool.token1()).toLowerCase();
    
    console.log(`Token0: ${token0} ${token0 === CSL ? '(CSL)' : '(USDT)'}`);
    console.log(`Token1: ${token1} ${token1 === CSL ? '(CSL)' : '(USDT)'}`);
    
    // Get tick cumulatives
    const [tickCumulatives] = await pool.observe([WINDOW_SEC, 0]);
    console.log('Tick cumulatives:', tickCumulatives.map(t => t.toString()));
    
    const tickAvg = (tickCumulatives[1].sub(tickCumulatives[0])).div(WINDOW_SEC);
    console.log('Tick average:', tickAvg.toString());
    
    // Calculate raw price
    const priceToken1PerToken0 = Math.pow(1.0001, Number(tickAvg));
    console.log('Raw price (token1 per token0):', priceToken1PerToken0);
    
    // Get token decimals to normalize the price
    const token0Decimals = token0 === CSL ? 18 : 6;
    const token1Decimals = token0 === CSL ? 6 : 18;
    
    // Calculate the decimal adjustment factor
    const decimalAdjustment = Math.pow(10, token1Decimals - token0Decimals);
    
    // Calculate final price with decimal adjustment
    let priceCslInUsdt;
    if (token0 === CSL) {
      priceCslInUsdt = priceToken1PerToken0 * decimalAdjustment;
    } else {
      priceCslInUsdt = (1 / priceToken1PerToken0) * decimalAdjustment;
    }
    
    console.log('Final CSL price in USDT:', priceCslInUsdt.toFixed(8));
    console.log('This is the price that will be displayed in the UI');
    
  } catch (error) {
    console.error('Error checking TWAP:', error);
  }
}

checkTwap().catch(console.error);
