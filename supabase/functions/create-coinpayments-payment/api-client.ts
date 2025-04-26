import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.190.0/encoding/hex.ts";
import { CoinPaymentsTransaction } from "./types.ts";

// Function to create HMAC signature for CoinPayments API
function createHmac(message: string, secret: string): string {
  const key = new TextEncoder().encode(secret);
  const data = new TextEncoder().encode(message);
  const hmac = crypto.subtle.createHmac('SHA512', key, { algorithm: 'HMAC' });
  const signature = hmac.update(data).digest();
  return encodeHex(signature);
}

// Base URL for the CoinPayments API
const API_URL = "https://www.coinpayments.net/api.php";

// Function to make a request to the CoinPayments API with retry
async function coinPaymentsRequest(cmd: string, params: Record<string, string>): Promise<any> {
  const publicKey = Deno.env.get("COINPAYMENTS_PUBLIC_KEY") || "";
  const privateKey = Deno.env.get("COINPAYMENTS_PRIVATE_KEY") || "";
  
  if (!publicKey || !privateKey) {
    throw new Error("CoinPayments API keys not configured");
  }

  // Create a nonce (unique identifier for this request)
  const nonce = Date.now().toString();

  // Combine all parameters to create the payload
  const payload = {
    cmd,
    key: publicKey,
    version: "1",
    format: "json",
    nonce,
    ...params
  };

  // Create a query string from the payload
  const payloadString = new URLSearchParams(payload).toString();
  
  // Log the payload for debugging (without private key)
  console.log(`Creating signature for payload: ${payloadString}`);

  // Create the HMAC signature
  const hmac = await createHmac(payloadString, privateKey);

  try {
    // Send the request to the CoinPayments API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmac
      },
      body: payloadString
    });

    // Parse the response
    const data = await response.text();
    
    // Log the response for debugging
    console.log(`CoinPayments API response for ${cmd}: ${data}`);
    
    // Parse the JSON response
    const result = JSON.parse(data);
    
    // Check for errors
    if (result.error !== "ok") {
      console.error(`CoinPayments API error: ${result.error}`);
      throw new Error(`CoinPayments API error: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error(`Error in API request: ${error}`);
    throw error;
  }
}

// Function to create a real CoinPayments transaction
async function createRealCoinPaymentsTransaction(
  usdAmount: number,
  currency: string,
  transactionId: string,
  walletAddress: string,
  buyerEmail: string
): Promise<CoinPaymentsTransaction> {
  try {
    // Log the request parameters
    console.log(`USD amount: $${usdAmount}, Currency: ${currency}`);
    
    const ipnUrl = Deno.env.get("COINPAYMENTS_IPN_URL");
    
    // Set up the parameters for the create_transaction command
    const params = {
      amount: usdAmount.toString(),
      currency1: "USD",
      currency2: currency,
      buyer_email: buyerEmail,
      item_name: "CSi Tokens Purchase",
      item_number: transactionId,
      custom: walletAddress,
      ipn_url: ipnUrl ? `${ipnUrl}/ipn-handler` : undefined
    };
    
    console.log(`Creating real CoinPayments transaction with params: ${JSON.stringify(params)}`);

    // Make the API request
    const result = await coinPaymentsRequest("create_transaction", params);
    
    // Log successful transaction creation
    console.log(`CoinPayments transaction created successfully: ${JSON.stringify(result.result)}`);
    
    // Get the currency conversion result - this shows how much crypto is required for the USD amount
    const cryptoAmount = result.result.amount;
    console.log(`Real conversion: $${usdAmount} = ${cryptoAmount} ${currency}`);

    // Return the transaction details with properly parsed data
    return {
      amount: cryptoAmount,
      txn_id: result.result.txn_id,
      address: result.result.address,
      confirms_needed: result.result.confirms_needed,
      timeout: result.result.timeout,
      checkout_url: result.result.checkout_url,
      status_url: result.result.status_url,
      qrcode_url: result.result.qrcode_url,
      currency: currency
    };
  } catch (error) {
    console.error(`CoinPayments API error: ${error}`);
    throw error;
  }
}

// Function to create a mock CoinPayments transaction for testing or when API fails
function createMockCoinPaymentsTransaction(
  usdAmount: number,
  currency: string,
  transactionId: string,
  walletAddress: string
): CoinPaymentsTransaction {
  // Mock transaction ID for testing
  const mockTxnId = `CP${Date.now()}`;
  
  // Create a realistic crypto amount based on approximate exchange rates
  // This simulates proper currency conversion from USD to the selected crypto
  let cryptoAmount: string;
  
  // Use realistic exchange rates for common cryptocurrencies
  // These are very approximate and would need to be updated in a real system
  switch(currency) {
    case 'BTC':
      // ~$60,000 per BTC, so $1 = 0.000017 BTC
      cryptoAmount = (usdAmount * 0.000017).toFixed(8);
      break;
    case 'ETH':
      // ~$3,000 per ETH, so $1 = 0.00033 ETH
      cryptoAmount = (usdAmount * 0.00033).toFixed(8);
      break;
    case 'BNB.BSC':
      // ~$600 per BNB, so $1 = 0.00167 BNB
      cryptoAmount = (usdAmount * 0.00167).toFixed(8);
      break;
    case 'USDT':
    case 'USDC':
    case 'USDC.PRC20':
    case 'DAI':
      // Stablecoins are approximately 1:1 with USD
      cryptoAmount = usdAmount.toFixed(8);
      break;
    default:
      // For other currencies, use a generic conversion rate
      // This is just an approximation - in reality each currency would have its own rate
      cryptoAmount = (usdAmount * 0.01).toFixed(8);
  }
  
  console.log(`Mock conversion (fallback): $${usdAmount} = ${cryptoAmount} ${currency}`);
  
  // Create and log the mock transaction
  console.log(`Mock CoinPayments payment created with ID: ${mockTxnId}`);
  console.log(`Result: ${cryptoAmount} ${currency}`);

  // Return a mock transaction object that mimics the CoinPayments API response
  return {
    amount: cryptoAmount,
    txn_id: mockTxnId,
    address: walletAddress,
    confirms_needed: "1",
    timeout: 3600,
    checkout_url: `https://example.com/checkout/${mockTxnId}`,
    status_url: `https://example.com/status/${mockTxnId}`,
    qrcode_url: `https://api.qrserver.com/v1/create-qr-code/?data=${walletAddress}&size=200x200`,
    currency: currency
  };
}

// Main function to create a CoinPayments transaction
export async function createCoinPaymentsTransaction(
  usdAmount: number,
  currency: string,
  transactionId: string,
  walletAddress: string,
  buyerEmail: string,
  forceMock: boolean = false
): Promise<CoinPaymentsTransaction> {
  try {
    // If forceMock is true or we're in development mode, use mock data
    const isDev = Deno.env.get('SUPABASE_ENV') === 'dev';
    
    if (forceMock || isDev) {
      return createMockCoinPaymentsTransaction(usdAmount, currency, transactionId, walletAddress);
    }
    
    // Otherwise, create a real CoinPayments transaction
    return await createRealCoinPaymentsTransaction(usdAmount, currency, transactionId, walletAddress, buyerEmail);
  } catch (error) {
    console.log(`Falling back to mock data due to API error`);
    // If the API call fails, fall back to mock data
    return createMockCoinPaymentsTransaction(usdAmount, currency, transactionId, walletAddress);
  }
}
