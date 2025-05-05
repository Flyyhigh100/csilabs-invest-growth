
import { fetchUniswapV4Twap } from '../uniswapV4TwapService';

// Mock the V4 price service
jest.mock('../uniswapV4PriceService', () => ({
  fetchUniswapV4Price: jest.fn().mockResolvedValue(0.12345)
}));

// Mock validation and cache functions
jest.mock('../utils/priceValidation', () => ({
  isValidPrice: jest.fn().mockReturnValue(true)
}));

jest.mock('../utils/priceCache', () => ({
  setCachedPrice: jest.fn()
}));

describe('Uniswap V4 TWAP Service', () => {
  test('V4 TWAP returns positive price', async () => {
    const price = await fetchUniswapV4Twap();
    expect(price).toBeGreaterThan(0);
  }, 30000); // Extend timeout for potential API calls
});
