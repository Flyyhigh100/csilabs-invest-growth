
import { UNISWAP_SUBGRAPH_URL, TOKEN_ADDRESS } from './config';

const createUniswapQuery = () => `{
  token(id: "${TOKEN_ADDRESS.toLowerCase()}") {
    derivedETH
    totalLiquidity
  }
  bundle(id: "1") {
    ethPrice
  }
}`;

export const fetchUniswapTokenPrice = async (): Promise<number> => {
  try {
    console.log('Fetching price from Uniswap Subgraph:', new Date().toISOString());
    
    const response = await fetch(UNISWAP_SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: createUniswapQuery()
      })
    });

    if (!response.ok) {
      throw new Error(`Uniswap API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Uniswap API Response:', data);

    if (!data.data?.token || !data.data?.bundle) {
      throw new Error('Invalid response format from Uniswap API');
    }

    const tokenDerivedETH = parseFloat(data.data.token.derivedETH);
    const ethPriceUSD = parseFloat(data.data.bundle.ethPrice);
    const tokenPriceUSD = tokenDerivedETH * ethPriceUSD;

    if (isNaN(tokenPriceUSD) || tokenPriceUSD <= 0) {
      throw new Error('Invalid price calculation');
    }

    console.log('Calculated token price:', tokenPriceUSD);
    return tokenPriceUSD;
  } catch (error) {
    console.error('Error fetching token price from Uniswap:', error);
    throw error;
  }
};
