
import { createHmac } from "https://deno.land/std@0.190.0/node/crypto.ts";
import { encode as hexEncode } from "https://deno.land/std@0.190.0/encoding/hex.ts";

/**
 * Makes a request to the CoinPayments API to check a transaction status
 */
export async function checkCoinPaymentsTransaction(txnId: string): Promise<any> {
  try {
    console.log(`Checking status for CoinPayments transaction: ${txnId}`);
    
    // Get API credentials from environment
    const publicKey = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
    const privateKey = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');
    
    if (!publicKey || !privateKey) {
      console.error('Missing CoinPayments API keys');
      return {
        error: true,
        status_text: 'Missing CoinPayments API keys in server configuration'
      };
    }
    
    try {
      // Prepare request data
      const requestData = new URLSearchParams();
      requestData.append('version', '1');
      requestData.append('cmd', 'get_tx_info');
      requestData.append('key', publicKey);
      requestData.append('txid', txnId);
      requestData.append('full', '1');
      
      // Add timestamp for request
      const requestTime = Math.floor(Date.now() / 1000).toString();
      requestData.append('format', 'json');
      requestData.append('nonce', requestTime);
      
      // Create HMAC signature using Deno's crypto
      const hmac = createHmac('sha512', privateKey);
      hmac.update(requestData.toString());
      const signature = hmac.digest('hex');
      
      console.log(`Making API request to CoinPayments for transaction ${txnId}`);
      
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
      
      console.log(`CoinPayments API response for ${txnId}:`, JSON.stringify(data).substring(0, 200) + '...');
      
      // Handle API errors
      if (data.error !== 'ok') {
        console.error('CoinPayments API error:', data.error);
        return {
          error: true,
          status_text: `API error: ${data.error}`
        };
      }
      
      // Return successful response
      return {
        error: false,
        result: data.result
      };
    } catch (apiError) {
      console.error('Error making API request to CoinPayments:', apiError);
      return {
        error: true,
        status_text: `API request failed: ${apiError.message}`
      };
    }
  } catch (error) {
    console.error('Unhandled exception in checkCoinPaymentsTransaction:', error);
    return {
      error: true,
      status_text: `Exception: ${error.message}`
    };
  }
}
