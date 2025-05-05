
import { querySqrtPriceX96, convertQ96ToDecimal, fetchSubgraphPrice } from '../uniswapV4TwapService';

// Define the mock response type to match our interface
interface PoolQueryResponse {
  pool: {
    sqrtPriceX96: string;
  };
}

// Mock the GraphQL request function
jest.mock('graphql-request', () => ({
  gql: jest.fn((query) => query),
  request: jest.fn().mockResolvedValue({
    pool: {
      sqrtPriceX96: '79228162514264337593543950336' // exactly 1 << 96
    }
  } as PoolQueryResponse)
}));

// Mock validation and cache functions
jest.mock('../utils/priceValidation', () => ({
  isValidPrice: jest.fn().mockReturnValue(true)
}));

jest.mock('../utils/priceCache', () => ({
  setCachedPrice: jest.fn()
}));

describe('Uniswap V4 TWAP Service', () => {
  test('querySqrtPriceX96 returns correct value', async () => {
    const result = await querySqrtPriceX96('test-pool-id');
    expect(result.toString()).toBe('79228162514264337593543950336');
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
});
