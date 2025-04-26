/**
 * Generate HMAC signature for CoinPayments API
 */
export async function generateHmacSignature(privateKey: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = encoder.encode(privateKey);
  const message = encoder.encode(data);
  
  // Create the HMAC key
  const cryptoKey = await crypto.subtle.importKey(
    "raw", key, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]
  );
  
  // Sign the message
  const signature = await crypto.subtle.sign(
    "HMAC", cryptoKey, message
  );
  
  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Encrypts a message using a key with HMAC-SHA512
 */
export async function encryptHmacSha512(key: string, message: string): Promise<string> {
  return await generateHmacSignature(key, message);
}

/**
 * Verify HMAC signature from IPN
 */
export async function verifyHmacSignature(data: any, signature: string, ipnSecret: string): Promise<boolean> {
  try {
    // Convert data to string if it's not already
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Generate HMAC signature using the IPN secret
    const calculatedSignature = await encryptHmacSha512(ipnSecret, dataStr);
    
    // Compare signatures (case-insensitive)
    return signature.toLowerCase() === calculatedSignature.toLowerCase();
  } catch (error) {
    console.error('Error verifying HMAC signature:', error);
    return false;
  }
}

/**
 * Create a new crypto payment transaction
 */
export async function createCryptoPayment(amount: number, walletAddress: string, currency: string = 'USDT'): Promise<any> {
  try {
    // Get API credentials from environment
    const publicKey = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
    const privateKey = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');
    
    if (!publicKey || !privateKey) {
      console.error('Missing CoinPayments API keys');
      throw new Error('CoinPayments API keys not configured');
    }
    
    // Prepare request data
    const requestData = new URLSearchParams();
    requestData.append('version', '1');
    requestData.append('cmd', 'create_transaction');
    requestData.append('key', publicKey);
    requestData.append('amount', amount.toString());
    requestData.append('currency1', 'USD');
    requestData.append('currency2', currency);
    requestData.append('buyer_email', 'buyer@example.com'); // This will be replaced with the actual user's email
    requestData.append('address', walletAddress);
    
    // Add timestamp for request
    const requestTime = Math.floor(Date.now() / 1000).toString();
    requestData.append('format', 'json');
    requestData.append('nonce', requestTime);
    
    // Generate HMAC signature
    const signature = await generateHmacSignature(privateKey, requestData.toString());
    
    console.log(`Creating CoinPayments transaction for amount: ${amount} ${currency}`);
    
    // Make the API request
    const response = await fetch('https://www.coinpayments.net/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': signature
      },
      body: requestData
    });
    
    // Parse the response
    const data = await response.json();
    console.log('CoinPayments API response:', data);
    
    if (data.error !== 'ok') {
      console.error('CoinPayments API error:', data.error);
      throw new Error(`CoinPayments API error: ${data.error}`);
    }
    
    return {
      success: true,
      address: data.result.address,
      amount: data.result.amount,
      txn_id: data.result.txn_id,
      status_url: data.result.status_url,
      qrcode_url: data.result.qrcode_url,
      timeout: data.result.timeout
    };
  } catch (error) {
    console.error('Error creating crypto payment:', error);
    throw error;
  }
}
