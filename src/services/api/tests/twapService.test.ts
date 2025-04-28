
import { fetchOnchainTwap } from '../twapPriceService';

describe('TWAP Price Service', () => {
  test('TWAP returns positive price', async () => {
    const p = await fetchOnchainTwap();
    expect(p).toBeGreaterThan(0);
  }, 30000); // Extend timeout for on-chain calls
});
