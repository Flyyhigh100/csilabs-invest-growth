
import { queryV4PoolData, convertQ96ToDecimal, fetchSubgraphPrice, getTwapStatus } from '../uniswapV4TwapService';

// Define the mock response type to match our interface
interface PoolQueryResponse {
  pools: Array<{
    id: string;
    token0: { id: string; symbol: string; decimals: string };
    token1: { id: string; symbol: string; decimals: string };
    sqrtPriceX96: string;
  }>;
}

// Mock the GraphQL request function
jest.mock('graphql-request', () => ({
  gql: jest.fn((query) => query),
  request: jest.fn().mockResolvedValue({
    pools: [{
      id: 'mock-pool-id',
      token0: { id: '0x123', symbol: 'TOKEN0', decimals: '18' },
      token1: { id: '0x456', symbol: 'TOKEN1', decimals: '6' },
      sqrtPriceX96: '79228162514264337593543950336' // exactly 1 << 96
    }]
  })
}));

// Mock validation and cache functions
jest.mock('../utils/priceValidation', () => ({
  isValidPrice: jest.fn().mockReturnValue(true),
  MIN_VALID_PRICE: 0.00001,
  MAX_VALID_PRICE: 1000
}));

jest.mock('../utils/priceCache', () => ({
  setCachedPrice: jest.fn()
}));

// Mock the environment variables
const originalEnv = process.env;

describe('Uniswap V4 TWAP Service', () => {
  let consoleDebugSpy;
  
  beforeEach(() => {
    // Setup console spies
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    
    // Reset mock environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('queryV4PoolData returns correct value', async () => {
    const result = await queryV4PoolData();
    expect(result.sqrtPriceX96.toString()).toBe('79228162514264337593543950336');
  });

  test('convertQ96ToDecimal converts sqrtPriceX96 correctly', () => {
    // Test with 1 << 96 (2^96), which should result in a price of 1.0
    const sqrtPriceX96 = BigInt('79228162514264337593543950336'); // 2^96
    const price = convertQ96ToDecimal(sqrtPriceX96);
    expect(price).toBe(1);
  });

  test('fetchSubgraphPrice returns correct price', async () => {
    const price = await fetchSubgraphPrice();
    expect(price).toBe(1); // Should be 1.0 based on our mock
  }, 30000); // Extend timeout for potential API calls

  test('debug logging is triggered when DEBUG_TWAP is enabled', async () => {
    // Set DEBUG_TWAP to true
    process.env.VITE_DEBUG_TWAP = 'true';
    
    // Force re-import of the module to pick up the env change
    jest.resetModules();
    const freshModule = await import('../uniswapV4TwapService');
    
    // Call the function
    await freshModule.fetchSubgraphPrice();
    
    // Verify debug logs were called
    expect(consoleDebugSpy).toHaveBeenCalled();
    
    // At least one call should contain DEBUG_TWAP
    const debugCalls = consoleDebugSpy.mock.calls;
    const hasDebugTwapCall = debugCalls.some(call => 
      call[0] && typeof call[0] === 'string' && call[0].includes('DEBUG_TWAP'));
    
    expect(hasDebugTwapCall).toBe(true);
  });

  test('getTwapStatus returns the correct status object structure', () => {
    const status = getTwapStatus();
    expect(status).toHaveProperty('lastAttempt');
    expect(status).toHaveProperty('lastError');
    expect(status).toHaveProperty('lastPrice');
    expect(status).toHaveProperty('source');
  });
});
