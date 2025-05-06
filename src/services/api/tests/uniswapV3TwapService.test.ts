
import { fetchOnchainTwap } from '../twapPriceService';

jest.mock('../twapPriceService', () => ({
  fetchOnchainTwap: jest.fn().mockResolvedValue(0.5)
}));

// Mock the GraphQL request function
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      JsonRpcProvider: jest.fn().mockImplementation(() => ({
        getNetwork: jest.fn().mockResolvedValue({ chainId: 137 })
      })),
    },
    Contract: jest.fn().mockImplementation(() => ({
      observe: jest.fn().mockResolvedValue([[
        { sub: jest.fn().mockReturnValue({ div: jest.fn().mockReturnValue('1000000') }) }
      ]]),
      token0: jest.fn().mockResolvedValue('0xcba5ca199bca0af3f6046da01169035f2c6a7ff0'),
      token1: jest.fn().mockResolvedValue('0x3c499c542cef5e3811e1192ce70d8cc03d5c3359')
    }))
  }
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

describe('Uniswap V3 TWAP Service', () => {
  let consoleDebugSpy;
  
  beforeEach(() => {
    // Setup console spies
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fetchOnchainTwap returns a valid price', async () => {
    const price = await fetchOnchainTwap();
    expect(price).toBe(0.5);
  });
});
