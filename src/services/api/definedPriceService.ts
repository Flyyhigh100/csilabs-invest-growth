
import { isValidPrice } from './utils/priceValidation';
import { ENABLE_LOGGING, TOKEN_ADDRESS } from './config';

const API_KEY = '3fe52a290da2025bdddcc45a353c0268810eacf7';
// Use the CSL token address directly rather than the pool
const TOKEN_ADDRESS_TO_QUERY = TOKEN_ADDRESS;
const CHAIN_ID = '137'; // Polygon

export const fetchDefinedPrice = async (): Promise<number> => {
  if (ENABLE_LOGGING) {
    console.log('Fetching current price from Defined.fi for token:', TOKEN_ADDRESS_TO_QUERY);
  }
  
  try {
    // Format the API request for Defined.fi
    const url = `https://api.defined.fi/api/v0/query`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: `{
          getTokenByAddress(input: {
            address: "${TOKEN_ADDRESS_TO_QUERY}",
            chain: POLYGON
          }) {
            price
            name
            symbol
          }
        }`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Defined.fi API error:', response.status, errorText);
      throw new Error(`Defined.fi API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (ENABLE_LOGGING) {
      console.log('Raw Defined.fi price response:', data);
    }
    
    // Extract price from response
    const tokenData = data?.data?.getTokenByAddress;
    
    if (!tokenData || !isValidPrice(tokenData.price)) {
      console.error('Invalid price data received from Defined.fi:', tokenData);
      throw new Error('Invalid price data received from Defined.fi');
    }
    
    const price = parseFloat(tokenData.price);
    
    if (ENABLE_LOGGING) {
      console.log('Validated current price from Defined.fi:', price);
    }
    
    return price;
  } catch (error) {
    console.error('Error fetching price from Defined.fi:', error);
    throw error;
  }
};
