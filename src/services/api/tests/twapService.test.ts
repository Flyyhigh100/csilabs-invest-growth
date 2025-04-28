
import { fetchOnchainTwap } from '../twapPriceService';

// Mock the ethers contract to avoid actual blockchain calls during tests
jest.mock('ethers', () => {
  const mockTickCumulatives = [
    { sub: () => ({ div: () => 100 }) }, // This will result in a tick of 100
    {}
  ];
  
  return {
    ethers: {
      Contract: jest.fn().mockImplementation(() => ({
        observe: jest.fn().mockResolvedValue([mockTickCumulatives]),
        token0: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
      })),
      providers: {
        JsonRpcProvider: jest.fn().mockImplementation(() => ({}))
      }
    }
  };
});

// Also mock the validation and cache functions
jest.mock('../utils/priceValidation', () => ({
  isValidPrice: jest.fn().mockReturnValue(true)
}));

jest.mock('../utils/priceCache', () => ({
  setCachedPrice: jest.fn()
}));

describe('TWAP Price Service', () => {
  test('TWAP returns positive price', async () => {
    const p = await fetchOnchainTwap();
    expect(p).toBeGreaterThan(0);
  }, 30000); // Extend timeout for on-chain calls
});
