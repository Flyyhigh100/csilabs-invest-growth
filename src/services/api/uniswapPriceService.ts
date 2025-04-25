import { UNISWAP_SUBGRAPH_URL, TOKEN_ADDRESS, MAX_RETRIES, RETRY_DELAY, ENABLE_LOGGING } from './config';

const createUniswapV2Query = () => `{
  token(id: "${TOKEN_ADDRESS.toLowerCase()}") {
    derivedETH
  }
  bundle(id: "1") {
    ethPrice
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
      console.log('Fetching price from Uniswap V2 Subgraph:', new Date().toISOString());
    }
    
    const response = await fetchWithRetry(
      UNISWAP_SUBGRAPH_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: createUniswapV2Query()
        })
      }
    );

    const data = await response.json();
    
    if (ENABLE_LOGGING) {
      console.log('Uniswap V2 API Response:', data);
    }

    if (!data.data?.token || !data.data?.bundle) {
      throw new Error('Invalid response format from Uniswap V2 API');
    }

    const tokenDerivedETH = parseFloat(data.data.token.derivedETH);
    const ethPriceUSD = parseFloat(data.data.bundle.ethPrice);
    const tokenPriceUSD = tokenDerivedETH * ethPriceUSD;

    if (isNaN(tokenPriceUSD) || tokenPriceUSD <= 0) {
      throw new Error('Invalid price calculation');
    }

    if (ENABLE_LOGGING) {
      console.log('Calculated token price:', tokenPriceUSD);
    }

    return tokenPriceUSD;
  } catch (error) {
    console.error('Error fetching token price from Uniswap V2:', error);
    throw error;
  }
};
