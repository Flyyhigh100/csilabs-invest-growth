
// Mock implementation for local testing
const USE_MOCK_DATA = Deno.env.get("USE_MOCK_DATA") === "true";

// Define the CoinPayments transaction response interface
export interface CoinPaymentsTransaction {
  amount: string;
  address: string;
  txn_id: string;
  confirms_needed: string;
  timeout: number;
  checkout_url: string;
  status_url: string;
  qrcode_url: string;
  currency?: string;
}

/**
 * Generate HMAC signature for CoinPayments API
 */
function generateHmac(payload: string): string {
  try {
    const privateKey = Deno.env.get("COINPAYMENTS_PRIVATE_KEY") || "";
    if (!privateKey) {
      throw new Error("CoinPayments private key not configured");
    }
    
    // Convert payload and key to UInt8Array
    const keyData = new TextEncoder().encode(privateKey);
    const payloadData = new TextEncoder().encode(payload);
    
    // Create HMAC signature
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      payloadData
    );
    
    // Convert signature to hex string
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Error generating HMAC signature:', error);
    throw new Error(`Failed to generate HMAC signature: ${error.message}`);
  }
}

/**
 * Make a request to the CoinPayments API
 */
async function coinPaymentsRequest(command: string, params: Record<string, any> = {}): Promise<any> {
  try {
    const publicKey = Deno.env.get("COINPAYMENTS_PUBLIC_KEY");
    if (!publicKey) {
      throw new Error("CoinPayments public key not configured");
    }
    
    // Build query parameters
    const nonce = Date.now();
    
    const queryParams = new URLSearchParams({
      cmd: command,
      key: publicKey,
      version: "1",
      format: "json",
      nonce: nonce.toString(),
      ...params
    });
    
    const payload = queryParams.toString();
    console.log(`Creating signature for payload: ${payload}`);
    
    const hmac = await generateHmac(payload);
    
    // Send request to CoinPayments API
    const response = await fetch("https://www.coinpayments.net/api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "HMAC": hmac
      },
      body: payload
    });
    
    const data = await response.json();
    console.log(`CoinPayments API response for ${command}:`, JSON.stringify(data));
    
    if (data.error) {
      console.error(`CoinPayments API error: ${data.error}`);
      throw new Error(`CoinPayments API error: ${data.error}`);
    }
    
    return data.result;
  } catch (error) {
    console.error('Error in API request:', error);
    throw error;
  }
}

/**
 * Create a transaction with the CoinPayments API using real API
 */
async function createRealCoinPaymentsTransaction(
  amount: number,
  currency: string,
  itemNumber: string,
  walletAddress: string,
  buyerEmail: string,
  autoConfirm: boolean = false
): Promise<CoinPaymentsTransaction> {
  const params: Record<string, any> = {
    amount: amount.toString(),
    currency1: "USD", // Currency being converted from
    currency2: currency, // Currency being converted to
    buyer_email: buyerEmail,
    item_name: "CSi Tokens Purchase",
    item_number: itemNumber,
    custom: walletAddress,
    ipn_url: Deno.env.get("COINPAYMENTS_IPN_URL") // Optional IPN URL
  };
  
  if (autoConfirm) {
    params.auto_confirm = 1;
  }
  
  console.log(`Creating real CoinPayments transaction with params: ${JSON.stringify(params)}`);
  
  try {
    const result = await coinPaymentsRequest("create_transaction", params);
    return result;
  } catch (error) {
    console.error(`CoinPayments API error: ${error.message}`);
    
    if (USE_MOCK_DATA) {
      console.log(`Falling back to mock data due to API error`);
      return createMockTransaction(amount, currency, walletAddress);
    }
    
    throw error;
  }
}

/**
 * Create a mock transaction for testing
 */
function createMockTransaction(
  amount: number,
  currency: string,
  walletAddress: string
): CoinPaymentsTransaction {
  // Mock conversion rate based on currency
  const rates: Record<string, number> = {
    'BTC': 60000,
    'ETH': 3000,
    'USDT': 1,
    'USDC': 1,
    'BNB.BSC': 600
  };
  
  const rate = rates[currency] || 1;
  const cryptoAmount = (amount / rate).toFixed(8);
  
  // Generate mock address based on currency
  const addresses: Record<string, string> = {
    'BTC': '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
    'ETH': '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    'USDT': '0xdac17f958d2ee523a2206206994597c13d831ec7',
    'USDC': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    'BNB.BSC': '0xd6c2ae7825b7e2fa65d3dd3c1ff5eeecdcaaef11'
  };
  
  const address = addresses[currency] || walletAddress;
  
  console.log(`Mock conversion: $${amount} = ${cryptoAmount} ${currency}`);
  
  // Generate a mock transaction ID
  const txnId = `CP${Date.now()}`;
  console.log(`Mock payment created with ID: ${txnId}`);
  
  // Generate QR code data
  const qrData = {
    address,
    amount: cryptoAmount,
    currency
  };
  
  console.log(`QR code data: ${JSON.stringify(qrData, null, 2)}`);
  
  // Generate a payment address
  console.log(`Generated payment address: ${address}`);
  
  return {
    amount: cryptoAmount,
    txn_id: txnId,
    address: address,
    confirms_needed: "1",
    timeout: 3600, // 1 hour in seconds
    checkout_url: `https://www.coinpayments.net/index.php?cmd=checkout&id=${txnId}`,
    status_url: `https://www.coinpayments.net/index.php?cmd=status&id=${txnId}`,
    qrcode_url: `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(JSON.stringify(qrData))}&choe=UTF-8`,
    currency
  };
}

/**
 * Public function to create a CoinPayments transaction
 */
export async function createCoinPaymentsTransaction(
  amount: number,
  currency: string,
  itemId: string,
  walletAddress: string,
  buyerEmail: string = 'buyer@example.com',
  autoConfirm: boolean = false
): Promise<CoinPaymentsTransaction> {
  // Use mock data for development/testing
  if (USE_MOCK_DATA) {
    console.log('Using mock data for CoinPayments transaction');
    return createMockTransaction(amount, currency, walletAddress);
  }
  
  // Use real API for production
  console.log(`USD amount: $${amount}, Currency: ${currency}`);
  return createRealCoinPaymentsTransaction(amount, currency, itemId, walletAddress, buyerEmail, autoConfirm);
}
