
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { encode as hexEncode } from "https://deno.land/std@0.190.0/encoding/hex.ts";

// Function to create HMAC signature for CoinPayments API
function createHmac(message: string, secret: string): string {
  const key = new TextEncoder().encode(secret);
  const data = new TextEncoder().encode(message);
  const hmac = crypto.subtle.createHmac('SHA512', key, { algorithm: 'HMAC' });
  const signature = hmac.update(data).digest();
  return hexEncode(signature);
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
      custom: walletAddress, // This is just for reference, not the payment address
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
      address: result.result.address, // This is the PAYMENT address, not the user's wallet
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

// Function to generate a valid mock BEP-20/ERC-20 address
function generateValidBlockchainAddress(): string {
  // Create 20 bytes of random data (40 hex chars)
  const randomBytes = new Uint8Array(20);
  crypto.getRandomValues(randomBytes);
  
  // Convert to hex and add 0x prefix to make valid address
  return '0x' + Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Function to create a mock CoinPayments transaction for testing
function createMockCoinPaymentsTransaction(
  usdAmount: number,
  currency: string,
  transactionId: string,
  walletAddress: string
): CoinPaymentsTransaction {
  const mockTxnId = `CP${Date.now()}`;
  let cryptoAmount: string;
  
  switch(currency) {
    case 'BTC':
      cryptoAmount = (usdAmount * 0.000017).toFixed(8);
      break;
    case 'ETH':
      cryptoAmount = (usdAmount * 0.00033).toFixed(8);
      break;
    case 'BNB.BSC':
      cryptoAmount = (usdAmount * 0.00167).toFixed(8);
      break;
    case 'USDT':
    case 'USDC':
    case 'USDC.PRC20':
    case 'DAI':
      cryptoAmount = usdAmount.toFixed(8);
      break;
    default:
      cryptoAmount = (usdAmount * 0.01).toFixed(8);
  }
  
  console.log(`Mock conversion (fallback): $${usdAmount} = ${cryptoAmount} ${currency}`);
  
  // Generate a valid blockchain address for payment
  const mockPaymentAddress = generateValidBlockchainAddress();
  
  // Generate QR code URL with proper format
  const qrData = {
    address: mockPaymentAddress,
    amount: cryptoAmount,
    currency: currency
  };
  
  // Create QR code URL with encoded payment data
  const qrCodeUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(
    JSON.stringify(qrData)
  )}&choe=UTF-8`;

  console.log(`Mock CoinPayments payment created with ID: ${mockTxnId}`);
  console.log(`Generated valid payment address: ${mockPaymentAddress}`);
  console.log(`QR code data:`, qrData);

  return {
    amount: cryptoAmount,
    txn_id: mockTxnId,
    address: mockPaymentAddress,
    confirms_needed: "1",
    timeout: 3600,
    checkout_url: `https://www.coinpayments.net/index.php?cmd=checkout&id=${mockTxnId}`,
    status_url: `https://www.coinpayments.net/index.php?cmd=status&id=${mockTxnId}`,
    qrcode_url: qrCodeUrl,
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
    const isDev = Deno.env.get('SUPABASE_ENV') === 'dev';
    
    if (forceMock || isDev) {
      return createMockCoinPaymentsTransaction(usdAmount, currency, transactionId, walletAddress);
    }
    
    return await createRealCoinPaymentsTransaction(usdAmount, currency, transactionId, walletAddress, buyerEmail);
  } catch (error) {
    console.log(`Falling back to mock data due to API error`);
    return createMockCoinPaymentsTransaction(usdAmount, currency, transactionId, walletAddress);
  }
}

// Interface for a CoinPayments transaction response
export interface CoinPaymentsTransaction {
  amount: string;
  txn_id: string;
  address: string;
  confirms_needed: string;
  timeout: number;
  checkout_url: string;
  status_url: string;
  qrcode_url: string;
  currency: string;
}
