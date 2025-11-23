
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

/**
 * Makes a request to the CoinPayments API to check a transaction status
 */
export async function checkCoinPaymentsTransaction(txnId: string): Promise<any> {
  try {
    console.log(`Checking status for CoinPayments transaction: ${txnId}`);
    
    // Get API credentials from environment
    const publicKey = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
    const privateKey = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');
    const merchantId = Deno.env.get('COINPAYMENTS_MERCHANT_ID');
    
    if (!publicKey || !privateKey) {
      console.error('Missing CoinPayments API keys');
      return {
        error: true,
        status_text: 'Missing CoinPayments API keys in server configuration'
      };
    }
    
    // Enhanced merchant ID logging
    if (!merchantId) {
      console.warn("COINPAYMENTS_MERCHANT_ID not set - status check will default to account associated with API keys");
      console.log("Environment variables available:", Object.keys(Deno.env.toObject()).join(", "));
    } else {
      console.log(`Found merchant ID: ${merchantId} (${typeof merchantId})`);
    }
    
    try {
      // Prepare request data
      const requestData = new URLSearchParams();
      requestData.append('version', '1');
      requestData.append('cmd', 'get_tx_info');
      requestData.append('key', publicKey);
      requestData.append('txid', txnId);
      requestData.append('full', '1');
      
      // Add merchant parameter if available to ensure we're checking the right account
      if (merchantId) {
        requestData.append('merchant', merchantId);
        console.log('Added merchant ID to status check request');
      }
      
      // Create a unique nonce using microsecond precision
      // CoinPayments requires an integer nonce that is always increasing
      const microtime = performance.now() * 1000; // Convert to microseconds
      const timestamp = Date.now() * 1000; // Milliseconds to microseconds
      const nonce = Math.floor(timestamp + microtime).toString();
      console.log(`Using nonce: ${nonce} for transaction ${txnId}`);
      
      requestData.append('format', 'json');
      requestData.append('nonce', nonce);
      
      // Create HMAC signature using native crypto
      const encoder = new TextEncoder();
      const key = encoder.encode(privateKey);
      const message = encoder.encode(requestData.toString());
      const cryptoKey = await crypto.subtle.importKey(
        "raw", key, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]
      );
      const signature = await crypto.subtle.sign(
        "HMAC", cryptoKey, message
      );
      
      // Convert signature to hex string
      const signatureHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      console.log(`Making API request to CoinPayments for transaction ${txnId} with nonce ${nonce}`);
      console.log(`Request params: ${requestData.toString()}`);
      
      // Make the API request
      const response = await fetch('https://www.coinpayments.net/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'HMAC': signatureHex
        },
        body: requestData
      });
      
      // Parse the response
      const data = await response.json();
      
      console.log(`CoinPayments API response for ${txnId}:`, JSON.stringify(data).substring(0, 200) + '...');
      
      // Handle API errors
      if (data.error !== 'ok') {
        console.error('CoinPayments API error:', data.error);
        
        // Special handling for common errors
        if (data.error && data.error.includes('Could not find any transactions')) {
          return {
            error: true,
            status_text: 'Transaction not found in CoinPayments. It may not have been created yet or the transaction ID is incorrect.',
            notFound: true
          };
        }
        
        if (data.error && data.error.includes('Invalid nonce')) {
          return {
            error: true,
            status_text: 'API authentication error (invalid nonce). Please try again in a moment.',
            retryable: true
          };
        }
        
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
