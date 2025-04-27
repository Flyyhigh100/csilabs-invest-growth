
import { isValidPrice } from './utils/priceValidation';
import { ENABLE_LOGGING } from './config';

const API_KEY = '3fe52a290da2025bdddcc45a353c0268810eacf7';
const PAIR_ADDRESS = import.meta.env.VITE_PAIR_ADDRESS?.toLowerCase() ||
  '0x03f8fe849404dca3ae3e16ac4ff0b240dbc139f4';
const CHAIN_ID = '137'; // Polygon

export const fetchDefinedPrice = async (): Promise<number> => {
  if (ENABLE_LOGGING) {
    console.log('Fetching current price from Defined.fi for token:', PAIR_ADDRESS);
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
            address: "${PAIR_ADDRESS}",
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
