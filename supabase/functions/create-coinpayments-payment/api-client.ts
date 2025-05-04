
// Mock implementation for local testing
const USE_MOCK_DATA = Deno.env.get("USE_MOCK_DATA") === "true";
const ALLOW_MOCK_FALLBACK = Deno.env.get("ALLOW_MOCK_FALLBACK") === "true";

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
 * Generate HMAC signature for CoinPayments API with improved millisecond precision nonce
 */
async function generateHmac(payload: string): Promise<string> {
  try {
    const privateKey = Deno.env.get("COINPAYMENTS_PRIVATE_KEY") || "";
    if (!privateKey) {
      throw new Error("CoinPayments private key not configured");
    }
    
    console.log('Generating HMAC signature for payload length:', payload.length);
    
    // Convert payload and key to UInt8Array
    const keyData = new TextEncoder().encode(privateKey);
    const payloadData = new TextEncoder().encode(payload);
    
    // Create HMAC signature using crypto.subtle
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
    const hmac = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('').toUpperCase();
    
    console.log('Generated HMAC signature:', hmac.substring(0, 20) + '...');
    return hmac;
  } catch (error) {
    console.error('Error generating HMAC signature:', error);
    throw new Error(`Failed to generate HMAC signature: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate a unique nonce value for CoinPayments API with full millisecond precision
 * and random suffix to avoid collisions
 */
function generateNonce(): string {
  // Use a millisecond timestamp + random suffix for better uniqueness
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const nonce = `${timestamp}${randomSuffix}`;
  console.log(`Generated unique nonce: ${nonce}`);
  return nonce;
}

/**
 * Make a request to the CoinPayments API with improved error handling and nonce generation
 */
async function coinPaymentsRequest(command: string, params: Record<string, any> = {}): Promise<any> {
  try {
    const publicKey = Deno.env.get("COINPAYMENTS_PUBLIC_KEY");
    if (!publicKey) {
      throw new Error("CoinPayments public key not configured");
    }
    
    // Get merchant ID from environment with improved debugging
    const merchantId = Deno.env.get("COINPAYMENTS_MERCHANT_ID");
    
    // Debug environment variables
    console.log("Environment variables available:", Object.keys(Deno.env.toObject()).join(", "));
    
    if (!merchantId) {
      console.warn("COINPAYMENTS_MERCHANT_ID not set in environment. Payments may route to the default account.");
    } else {
      console.log(`Found merchant ID: ${merchantId} (${typeof merchantId})`);
    }
    
    // Build query parameters with updated nonce
    const nonce = generateNonce();
    console.log(`Using unique nonce: ${nonce}`);
    
    const queryParams = new URLSearchParams({
      cmd: command,
      key: publicKey,
      version: "1",
      format: "json",
      nonce: nonce,
      ...params
    });
    
    // Add merchant parameter if available
    if (merchantId) {
      queryParams.append('merchant', merchantId);
      console.log('Added merchant ID to API request');
    }
    
    const payload = queryParams.toString();
    console.log(`Creating signature for payload: ${payload.substring(0, 100)}${payload.length > 100 ? '...' : ''}`);
    
    const hmac = await generateHmac(payload);
    
    // Send request to CoinPayments API with detailed logging
    console.log('Sending request to CoinPayments API...');
    console.log('Request params:', queryParams.toString());
    
    const response = await fetch("https://www.coinpayments.net/api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "HMAC": hmac
      },
      body: payload
    });
    
    // Better HTTP error handling
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CoinPayments API HTTP error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`CoinPayments API HTTP error: ${response.status} ${response.statusText}`);
    }
    
    // Parse and validate API response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Error parsing API response:', parseError);
      throw new Error(`Could not parse CoinPayments API response: ${parseError.message}`);
    }
    
    console.log(`CoinPayments API response for ${command}: ${JSON.stringify(data).substring(0, 300)}...`);
    
    if (data.error !== "ok") {
      // Check for specific error cases
      if (data.error.includes("Amount too small")) {
        throw new Error("Transaction amount is too low to cover network fees");
      }
      console.error(`CoinPayments API error: ${data.error}`);
      throw new Error(`CoinPayments API error: ${data.error}`);
    }
    
    return data.result;
  } catch (error) {
    console.error('Error in API request:', error);
    
    // If mock data is allowed and enabled, fall back to mock implementation
    if (ALLOW_MOCK_FALLBACK || USE_MOCK_DATA) {
      console.log('Falling back to mock implementation');
      return createMockTransaction(params.amount, params.currency2, params.custom);
    }
    
    throw error;
  }
}

/**
 * Create a transaction with the CoinPayments API with improved validation
 */
async function createRealCoinPaymentsTransaction(
  amount: number,
  currency: string,
  itemNumber: string,
  walletAddress: string,
  buyerEmail: string = "anonymous@example.com",
  autoConfirm: boolean = true
): Promise<CoinPaymentsTransaction> {
  try {
    // Additional validation
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount: Must be greater than 0");
    }
    
    if (!currency) {
      throw new Error("Currency must be specified");
    }
    
    if (!walletAddress) {
      throw new Error("Wallet address must be provided");
    }
    
    // Get merchant ID for logging with improved debugging
    const merchantId = Deno.env.get("COINPAYMENTS_MERCHANT_ID");
    if (!merchantId) {
      console.warn("COINPAYMENTS_MERCHANT_ID not set - payment will default to account associated with API keys");
      // Try to find out what environment variables are available
      console.log("Available environment variables:", Object.keys(Deno.env.toObject()).join(", "));
    } else {
      console.log(`Creating transaction for merchant ID: ${merchantId}`);
    }
    
    const params: Record<string, any> = {
      amount: amount.toString(),
      currency1: "USD", // Currency being converted from
      currency2: currency, // Currency being converted to
      buyer_email: buyerEmail, // Provide a fallback email if none provided
      item_name: "CSi Tokens Purchase",
      item_number: itemNumber,
      custom: walletAddress,
      ipn_url: Deno.env.get("COINPAYMENTS_IPN_URL") || "https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/coinpayments-ipn-webhook"
    };
    
    // Enable auto confirm - makes payments confirm quickly for testing
    if (autoConfirm) {
      params.auto_confirm = "1";
    }
    
    console.log(`Creating real CoinPayments transaction with params: ${JSON.stringify(params)}`);
    
    try {
      const result = await coinPaymentsRequest("create_transaction", params);
      console.log("Successfully created CoinPayments transaction:", JSON.stringify(result).substring(0, 200));
      return result;
    } catch (apiError) {
      console.error(`CoinPayments API error: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
      
      if (ALLOW_MOCK_FALLBACK) {
        console.log(`Falling back to mock data due to API error`);
        return createMockTransaction(amount, currency, walletAddress);
      }
      
      throw apiError;
    }
  } catch (error) {
    console.error(`Error creating CoinPayments transaction: ${error instanceof Error ? error.message : String(error)}`);
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
    'BNB.BSC': 600,
    'LTC': 80,
    'DOGE': 0.1,
    'TRX': 0.08
  };
  
  const rate = rates[currency] || 1;
  const cryptoAmount = (amount / rate).toFixed(8);
  
  // Generate mock address based on currency
  const addresses: Record<string, string> = {
    'BTC': '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
    'ETH': '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    'USDT': '0xdac17f958d2ee523a2206206994597c13d831ec7',
    'USDC': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    'BNB.BSC': '0xd6c2ae7825b7e2fa65d3dd3c1ff5eeecdcaaef11',
    'LTC': 'LTCnEH7zEc4FeJd2vzQFLSPMxYr5kJY2o4',
    'DOGE': 'DLhMGJCXPyDvzmL5uZA1W5G789dun7YjMz',
    'TRX': 'TBmGFmVwikNcKcMf8DXvEspRzWKiWrh6CB'
  };
  
  const address = addresses[currency] || walletAddress;
  
  console.log(`Mock conversion: $${amount} = ${cryptoAmount} ${currency}`);
  
  // Generate a mock transaction ID with a timestamp to ensure uniqueness
  const txnId = `CP${Date.now()}`;
  console.log(`Mock payment created with ID: ${txnId}`);
  
  // Generate QR code data
  const qrData = {
    address,
    amount: cryptoAmount,
    currency
  };
  
  // Generate a modified Google Charts QR code URL
  const qrcodeUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(JSON.stringify(qrData))}&choe=UTF-8`;
  
  return {
    amount: cryptoAmount,
    txn_id: txnId,
    address: address,
    confirms_needed: "1",
    timeout: 3600, // 1 hour in seconds
    checkout_url: `https://www.coinpayments.net/index.php?cmd=checkout&id=${txnId}`,
    status_url: `https://www.coinpayments.net/index.php?cmd=status&id=${txnId}`,
    qrcode_url: qrcodeUrl,
    currency: currency
  };
}

/**
 * Main function to create a CoinPayments transaction with improved validations
 */
export async function createCoinPaymentsTransaction(
  amount: number,
  currency: string,
  itemNumber: string,
  walletAddress: string
): Promise<CoinPaymentsTransaction> {
  // Validate required parameters
  if (!amount || amount <= 0) {
    throw new Error("Invalid amount: Must be greater than 0");
  }
  
  if (!currency) {
    throw new Error("Currency must be specified");
  }
  
  if (!walletAddress) {
    throw new Error("Wallet address must be provided");
  }
  
  // Use mock data if enabled via environment variable
  if (USE_MOCK_DATA) {
    console.log(`Using mock data for CoinPayments transaction (amount: ${amount} ${currency})`);
    return createMockTransaction(amount, currency, walletAddress);
  }
  
  // Otherwise use the real API
  return createRealCoinPaymentsTransaction(amount, currency, itemNumber, walletAddress);
}
