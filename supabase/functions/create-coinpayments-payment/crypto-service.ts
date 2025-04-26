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
export async function createCryptoPayment(
  amount: number, 
  walletAddress: string, 
  currency: string = 'USDT',
  tokenPrice?: number
): Promise<any> {
  try {
    console.log(`Creating CoinPayments payment with params:`, {
      amount,
      walletAddress,
      currency,
      tokenPrice
    });
    
    // Calculate token amount if price is provided
    const tokenAmount = tokenPrice ? amount / tokenPrice : amount;
    
    // Create transaction using the api client
    const result = await createCoinPaymentsTransaction(
      amount,
      currency,
      crypto.randomUUID(),
      walletAddress,
      'buyer@example.com',
      false
    );
    
    if (!result) {
      throw new Error('Failed to create CoinPayments transaction');
    }
    
    console.log('Transaction created successfully:', result);
    
    return {
      success: true,
      address: result.address,
      amount: result.amount,
      txn_id: result.txn_id,
      status_url: result.status_url,
      qrcode_url: result.qrcode_url,
      timeout: result.timeout,
      tokenAmount,
      tokenPrice
    };
  } catch (error) {
    console.error('Error in createCryptoPayment:', error);
    throw error;
  }
}
