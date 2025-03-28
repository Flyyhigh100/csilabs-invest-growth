
import { createSignature, generateMockPaymentData } from "./utils.ts";

const COINPAYMENTS_API_URL = 'https://www.coinpayments.net/api.php';
const COINPAYMENTS_PUBLIC_KEY = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
const COINPAYMENTS_PRIVATE_KEY = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');

// Helper function to make CoinPayments API request
export async function coinPaymentsRequest(command: string, params: Record<string, string>) {
  if (!COINPAYMENTS_PUBLIC_KEY || !COINPAYMENTS_PRIVATE_KEY) {
    throw new Error('CoinPayments API keys are not configured');
  }

  const requestParams = {
    cmd: command,
    key: COINPAYMENTS_PUBLIC_KEY,
    version: '1',
    format: 'json',
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
    return mockPaymentData;
  }
  
  try {
    const createTransactionParams = {
      amount: amount.toString(),
      currency1: 'USD',
      currency2: currency,
      buyer_email: userEmail || 'customer@example.com',
      item_name: 'CSi Tokens Purchase',
      item_number: transactionId,
      custom: walletAddress, // Store wallet address in custom field
      ipn_url: `${Deno.env.get('SUPABASE_FUNCTIONS_URL')}/ipn-handler`, // Would need to implement this separately
    };

    console.log('Attempting to create real CoinPayments transaction with params:', JSON.stringify(createTransactionParams));
    
    const paymentData = await coinPaymentsRequest('create_transaction', createTransactionParams);
    console.log('CoinPayments transaction created successfully:', JSON.stringify(paymentData));
    
    return paymentData;
  } catch (apiError) {
    console.error('CoinPayments API error:', apiError);
    
    // Fall back to mock data for testing if the API call fails
    console.log('Falling back to mock data due to API error');
    
    const mockPaymentData = generateMockPaymentData(amount.toString(), currency);
    console.log(`Mock CoinPayments payment created with ID: ${mockPaymentData.txn_id}`);
    
    return mockPaymentData;
  }
}
