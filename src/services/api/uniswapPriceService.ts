
import { UNISWAP_SUBGRAPH_URL, TOKEN_ADDRESS, MAX_RETRIES, RETRY_DELAY, ENABLE_LOGGING } from './config';

const createUniswapV3Query = () => `{
  pool(id: "${TOKEN_ADDRESS.toLowerCase()}") {
    token0Price
    token1Price
    token0 {
      symbol
      id
    }
    token1 {
      symbol
      id
    }
  }
  bundle(id: "1") {
    ethPriceUSD
  }
}`;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, retries: number = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries === 0) throw error;
    
    const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1);
    if (ENABLE_LOGGING) {
      console.log(`Retry attempt ${MAX_RETRIES - retries + 1}, waiting ${delay}ms...`);
    }
    
    await sleep(delay);
    return fetchWithRetry(url, options, retries - 1);
  }
}

export const fetchUniswapTokenPrice = async (): Promise<number> => {
  try {
    if (ENABLE_LOGGING) {
      console.log('Fetching price from Uniswap V3 Subgraph:', new Date().toISOString());
    }
    
    const response = await fetchWithRetry(
      UNISWAP_SUBGRAPH_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: createUniswapV3Query()
        })
      }
    );

    const data = await response.json();
    
    if (ENABLE_LOGGING) {
      console.log('Uniswap V3 API Response:', data);
    }

    if (!data.data?.pool || !data.data?.bundle) {
      throw new Error('Invalid response format from Uniswap V3 API');
    }

    const { pool, bundle } = data.data;
    let tokenPrice;

    // Determine if our token is token0 or token1 and calculate price accordingly
    if (pool.token0.id.toLowerCase() === TOKEN_ADDRESS.toLowerCase()) {
      tokenPrice = parseFloat(pool.token0Price);
    } else {
      tokenPrice = parseFloat(pool.token1Price);
    }

    const ethPriceUSD = parseFloat(bundle.ethPriceUSD);
    const tokenPriceUSD = tokenPrice * ethPriceUSD;

    if (isNaN(tokenPriceUSD) || tokenPriceUSD <= 0) {
      throw new Error('Invalid price calculation');
    }

    if (ENABLE_LOGGING) {
      console.log('Calculated token price:', tokenPriceUSD);
    }

    return tokenPriceUSD;
  } catch (error) {
    console.error('Error fetching token price from Uniswap V3:', error);
    
    // Add fallback to QuickSwap if Uniswap V3 fails
    try {
      if (ENABLE_LOGGING) {
        console.log('Attempting fallback to QuickSwap...');
      }
      
      const fallbackUrl = 'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06';
      const response = await fetchWithRetry(
        fallbackUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `{
              token(id: "${TOKEN_ADDRESS.toLowerCase()}") {
                derivedETH
                symbol
              }
              bundle(id: "1") {
                ethPrice
              }
            }`
          })
        }
      );

      const fallbackData = await response.json();
      
      if (!fallbackData.data?.token || !fallbackData.data?.bundle) {
        throw new Error('Invalid response format from QuickSwap API');
      }

      const tokenDerivedETH = parseFloat(fallbackData.data.token.derivedETH);
      const ethPriceUSD = parseFloat(fallbackData.data.bundle.ethPrice);
      const tokenPriceUSD = tokenDerivedETH * ethPriceUSD;

      if (isNaN(tokenPriceUSD) || tokenPriceUSD <= 0) {
        throw new Error('Invalid price calculation from fallback');
      }

      if (ENABLE_LOGGING) {
        console.log('Calculated token price from QuickSwap:', tokenPriceUSD);
      }

      return tokenPriceUSD;
    } catch (fallbackError) {
      console.error('Both Uniswap V3 and QuickSwap fallback failed:', fallbackError);
      throw new Error(`Price fetch failed: ${error.message}. Fallback also failed: ${fallbackError.message}`);
    }
  }
};

