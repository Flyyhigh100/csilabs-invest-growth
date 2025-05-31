
/**
 * Service for fetching cryptocurrency prices from various APIs
 */

interface CryptoPriceResponse {
  price: number;
  currency: string;
  timestamp: number;
}

/**
 * Fetch current cryptocurrency prices from CoinGecko API
 */
export const fetchCryptoPrice = async (symbol: string): Promise<number> => {
  try {
    // Map currency symbols to CoinGecko IDs
    const coinGeckoIds: Record<string, string> = {
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'BTC': 'bitcoin',
      'USDT': 'tether',
      'USDC': 'usd-coin'
    };

    const coinId = coinGeckoIds[symbol.toUpperCase()];
    if (!coinId) {
      throw new Error(`Unsupported cryptocurrency: ${symbol}`);
    }

    // For stablecoins, return 1.0 (assuming $1 peg)
    if (symbol === 'USDT' || symbol === 'USDC') {
      return 1.0;
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${symbol}: ${response.statusText}`);
    }

    const data = await response.json();
    const price = data[coinId]?.usd;

    if (!price) {
      throw new Error(`Price not found for ${symbol}`);
    }

    console.log(`Fetched ${symbol} price: $${price}`);
    return price;
  } catch (error) {
    console.error(`Error fetching ${symbol} price:`, error);
    throw error;
  }
};

/**
 * Convert USD amount to cryptocurrency amount
 */
export const convertUsdToCrypto = async (usdAmount: number, currency: string): Promise<number> => {
  try {
    const price = await fetchCryptoPrice(currency);
    const cryptoAmount = usdAmount / price;
    
    console.log(`Converting $${usdAmount} to ${currency}: ${cryptoAmount} ${currency}`);
    return cryptoAmount;
  } catch (error) {
    console.error(`Error converting USD to ${currency}:`, error);
    throw error;
  }
};

/**
 * Get appropriate decimal places for different cryptocurrencies
 */
export const getCryptoDecimals = (currency: string): number => {
  const decimals: Record<string, number> = {
    'BTC': 8,
    'ETH': 6,
    'BNB': 4,
    'USDT': 2,
    'USDC': 2
  };
  
  return decimals[currency.toUpperCase()] || 6;
};
