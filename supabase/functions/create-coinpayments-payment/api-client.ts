
import { createSignature, generateMockPaymentData } from "./utils.ts";

const COINPAYMENTS_API_URL = 'https://www.coinpayments.net/api.php';
const COINPAYMENTS_PUBLIC_KEY = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
const COINPAYMENTS_PRIVATE_KEY = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');

// Helper function to make CoinPayments API request
export async function coinPaymentsRequest(command: string, params: Record<string, string>) {
  if (!COINPAYMENTS_PUBLIC_KEY || !COINPAYMENTS_PRIVATE_KEY) {
    throw new Error('CoinPayments API keys are not configured');
  }

  // Add the required nonce parameter using the current timestamp
  const nonce = Date.now().toString();

  const requestParams = {
    cmd: command,
    key: COINPAYMENTS_PUBLIC_KEY,
    version: '1',
    format: 'json',
    nonce: nonce, // Add nonce here
    ...params,
  };

  const hmacSig = await createSignature(requestParams, COINPAYMENTS_PRIVATE_KEY);

  console.log(`Making CoinPayments API request for command: ${command}`);
  
  try {
    const response = await fetch(COINPAYMENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmacSig,
      },
      body: new URLSearchParams(requestParams),
    });

    const data = await response.json();
    
    console.log(`CoinPayments API response for ${command}:`, JSON.stringify(data));
    
    if (data.error !== 'ok') {
      console.error('CoinPayments API error:', data.error);
      throw new Error(`CoinPayments API error: ${data.error}`);
    }

    return data.result;
  } catch (error) {
    console.error('Error in API request:', error);
    throw error;
  }
}

// Create a transaction in CoinPayments
export async function createCoinPaymentsTransaction(
  amount: number, 
  currency: string, 
  transactionId: string, 
  walletAddress: string, 
  userEmail: string,
  forceMock: boolean = false
) {
  // Check if we have API keys, if not or if forceMock is true, use mock data
  if (forceMock || !COINPAYMENTS_PUBLIC_KEY || !COINPAYMENTS_PRIVATE_KEY) {
    console.log('Using mock data (missing API keys or mock mode requested)');
    const mockPaymentData = generateMockPaymentData(amount.toString(), currency);
    console.log(`Mock CoinPayments payment created with ID: ${mockPaymentData.txn_id}`);
    console.log(`Mock conversion: $${amount} = ${mockPaymentData.amount} ${currency}`);
    
    // Make sure the mock data has a clean address for the QR code
    if (mockPaymentData.address && mockPaymentData.address.includes(':')) {
      // Store the original address for reference
      mockPaymentData.original_address = mockPaymentData.address;
      // Clean the address for the QR code (without parameters)
      mockPaymentData.address = mockPaymentData.address.split(':').pop().split('@')[0];
      console.log(`Cleaned mock address: ${mockPaymentData.address}`);
    }
    
    return mockPaymentData;
  }
  
  try {
    // CRITICAL: Use currency1=USD and currency2=selected crypto to let CoinPayments handle conversion
    // This ensures proper conversion from USD to the selected cryptocurrency
    const createTransactionParams = {
      amount: amount.toString(),
      currency1: 'USD',          // Amount is specified in USD
      currency2: currency,       // User will pay with this cryptocurrency
      buyer_email: userEmail || 'customer@example.com',
      item_name: 'CSi Tokens Purchase',
      item_number: transactionId,
      custom: walletAddress,     // Store wallet address in custom field
      ipn_url: `${Deno.env.get('SUPABASE_FUNCTIONS_URL')}/ipn-handler`, // Would need to implement this separately
    };

    console.log('Creating real CoinPayments transaction with params:', JSON.stringify(createTransactionParams));
    console.log(`USD amount: $${amount}, Currency: ${currency}`);
    
    const paymentData = await coinPaymentsRequest('create_transaction', createTransactionParams);
    console.log('CoinPayments transaction created successfully:', JSON.stringify(paymentData));
    console.log(`Real conversion: $${amount} = ${paymentData.amount} ${currency}`);
    
    // Make sure the returned data has a clean address for the QR code
    if (paymentData.address && paymentData.address.includes(':')) {
      // Store the original address for reference
      paymentData.original_address = paymentData.address;
      // Clean the address for the QR code (without parameters)
      paymentData.address = paymentData.address.split(':').pop().split('@')[0];
      console.log(`Cleaned CoinPayments address: ${paymentData.address}`);
    }
    
    return paymentData;
  } catch (apiError) {
    console.error('CoinPayments API error:', apiError);
    
    // Fall back to mock data for testing if the API call fails
    console.log('Falling back to mock data due to API error');
    
    const mockPaymentData = generateMockPaymentData(amount.toString(), currency);
    console.log(`Mock CoinPayments payment created with ID: ${mockPaymentData.txn_id}`);
    console.log(`Mock conversion (fallback): $${amount} = ${mockPaymentData.amount} ${currency}`);
    
    // Make sure the mock data has a clean address for the QR code
    if (mockPaymentData.address && mockPaymentData.address.includes(':')) {
      // Store the original address for reference
      mockPaymentData.original_address = mockPaymentData.address;
      // Clean the address for the QR code (without parameters)
      mockPaymentData.address = mockPaymentData.address.split(':').pop().split('@')[0];
      console.log(`Cleaned fallback mock address: ${mockPaymentData.address}`);
    }
    
    return mockPaymentData;
  }
}

// Get available CoinPayments currencies
export async function getAvailableCurrencies(forceMock: boolean = false) {
  // If mock mode or missing API keys, return mock data
  if (forceMock || !COINPAYMENTS_PUBLIC_KEY || !COINPAYMENTS_PRIVATE_KEY) {
    console.log('Using mock currency data');
    return {
      BTC: { name: "Bitcoin", is_fiat: 0, rate_btc: "1.00", status: "online", accepted: 1 },
      LTC: { name: "Litecoin", is_fiat: 0, rate_btc: "0.01", status: "online", accepted: 1 },
      ETH: { name: "Ethereum", is_fiat: 0, rate_btc: "0.05", status: "online", accepted: 1 },
      DOGE: { name: "Dogecoin", is_fiat: 0, rate_btc: "0.000001", status: "online", accepted: 1 },
      USDT: { name: "Tether USD", is_fiat: 0, rate_btc: "0.000033", status: "online", accepted: 1 },
      BNB: { name: "Binance Coin", is_fiat: 0, rate_btc: "0.01", status: "online", accepted: 1 },
      XRP: { name: "Ripple", is_fiat: 0, rate_btc: "0.000025", status: "online", accepted: 1 },
      LTCT: { name: "Litecoin Testnet", is_fiat: 0, rate_btc: "0.01", status: "online", accepted: 1 },
    };
  }
  
  try {
    console.log('Fetching available currencies from CoinPayments API');
    const result = await coinPaymentsRequest('rates', { accepted: "1" });
    console.log(`Retrieved ${Object.keys(result).length} currencies from CoinPayments`);
    return result;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    
    // Fall back to mock data if the API call fails
    return {
      BTC: { name: "Bitcoin", is_fiat: 0, rate_btc: "1.00", status: "online", accepted: 1 },
      ETH: { name: "Ethereum", is_fiat: 0, rate_btc: "0.05", status: "online", accepted: 1 },
      USDT: { name: "Tether USD", is_fiat: 0, rate_btc: "0.000033", status: "online", accepted: 1 },
      BNB: { name: "Binance Coin", is_fiat: 0, rate_btc: "0.01", status: "online", accepted: 1 },
    };
  }
}
