
// Replace the incorrect import with the correct one for Deno
import { HmacSha512 } from "https://deno.land/std@0.177.0/crypto/hmac.ts";
import { encode as hexEncode } from "https://deno.land/std@0.177.0/encoding/hex.ts";

/**
 * Creates a new crypto payment via CoinPayments API
 */
export async function createCryptoPayment(
  amount: number,
  buyerEmail: string,
  currency: string = 'USDT'
): Promise<any> {
  try {
    console.log(`Creating CoinPayments transaction for ${amount} ${currency}`);
    
    // Get API credentials from environment
    const publicKey = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
    const privateKey = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');
    
    if (!publicKey || !privateKey) {
      console.error('Missing CoinPayments API keys');
      return {
        success: false,
        message: 'Missing CoinPayments API keys'
      };
    }
    
    // Prepare request data
    const requestData = new URLSearchParams();
    requestData.append('version', '1');
    requestData.append('cmd', 'create_transaction');
    requestData.append('key', publicKey);
    requestData.append('amount', amount.toString());
    requestData.append('currency1', 'USD');  // The currency we are charging in
    requestData.append('currency2', currency);  // The currency buyer will pay in
    requestData.append('buyer_email', buyerEmail);
    requestData.append('item_name', 'CSi Token Purchase');
    requestData.append('ipn_url', `${Deno.env.get('SUPABASE_URL')}/functions/v1/coinpayments-ipn-webhook`);
    
    // Add timestamp for request
    const requestTime = Math.floor(Date.now() / 1000).toString();
    requestData.append('format', 'json');
    requestData.append('nonce', requestTime);
    
    // Create HMAC signature using the correct Deno crypto methods
    const key = new TextEncoder().encode(privateKey);
    const message = new TextEncoder().encode(requestData.toString());
    const hmacSignature = new HmacSha512(key);
    hmacSignature.update(message);
    const signature = hexEncode(hmacSignature.digest());
    
    console.log(`Making API request to CoinPayments create transaction endpoint`);
    
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
    
    console.log('CoinPayments API response:', JSON.stringify(data).substring(0, 200) + '...');
    
    // Handle API errors
    if (data.error !== 'ok') {
      console.error('CoinPayments API error:', data.error);
      return {
        success: false,
        message: `API error: ${data.error}`
      };
    }
    
    // Return successful response
    return {
      success: true,
      txn_id: data.result.txn_id,
      status_url: data.result.status_url,
      qrcode_url: data.result.qrcode_url,
      address: data.result.address,
      timeout: data.result.timeout,
      amount: data.result.amount,
      amountf: data.result.amountf
    };
  } catch (error) {
    console.error('Error creating CoinPayments transaction:', error);
    return {
      success: false,
      message: error.message || 'Failed to create CoinPayments transaction'
    };
  }
}
