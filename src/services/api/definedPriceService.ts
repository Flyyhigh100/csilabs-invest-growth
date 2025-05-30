
import { makeDefinedCall } from './proxyService';
import { isValidPrice } from './utils/priceValidation';
import { TOKEN_ADDRESS, ENABLE_LOGGING } from './config';

/**
 * Fetches current token price from Defined.fi API via proxy
 */
export const fetchDefinedPrice = async (): Promise<number> => {
  try {
    if (ENABLE_LOGGING) {
      console.log('Fetching price from Defined.fi via proxy');
    }
    
    const query = `{
      getTokenByAddress(input: {
        address: "${TOKEN_ADDRESS}",
        chain: POLYGON
      }) {
        price
        name
        symbol
      }
    }`;
    
    const data = await makeDefinedCall(query);
    
    if (!data?.data?.getTokenByAddress?.price) {
      throw new Error('No price data returned from Defined.fi');
    }
    
    const price = parseFloat(data.data.getTokenByAddress.price);
    
    if (!isValidPrice(price)) {
      throw new Error(`Invalid Defined.fi price: ${price}`);
    }
    
    if (ENABLE_LOGGING) {
      console.log('Successfully fetched price from Defined.fi via proxy:', price);
    }
    
    return price;
  } catch (error) {
    console.error('Error fetching price from Defined.fi via proxy:', error);
    throw error;
  }
};
