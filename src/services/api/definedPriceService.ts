
import { TOKEN_ADDRESS, CHAIN_ID } from './config';

export const fetchDefinedTokenPrice = async (tokenAddress: string = TOKEN_ADDRESS): Promise<number> => {
  try {
    const response = await fetch(`https://api.defined.fi/api/v0/tokens/${CHAIN_ID}/${tokenAddress}/price`, {
      headers: {
        'Authorization': `Bearer ${process.env.DEFINED_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch price from Defined.fi');
    }

    const data = await response.json();
    return data.price;
  } catch (error) {
    console.error('Error fetching price from Defined.fi:', error);
    throw error;
  }
};
