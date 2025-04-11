
import { createSignature } from "./utils.ts";

// Check a CoinPayments transaction status
export async function checkCoinPaymentsTransaction(txnId: string) {
  try {
    // Get API keys from environment variables
    const publicKey = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
    const privateKey = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');
    
    if (!publicKey || !privateKey) {
      console.error('Missing CoinPayments API keys');
      return {
        error: true,
        status: -1,
        status_text: 'API credentials not configured'
      };
    }
    
    console.log(`Checking CoinPayments transaction: ${txnId}`);
    
    // Create request parameters
    const params = new URLSearchParams();
    params.append('cmd', 'get_tx_info');
    params.append('key', publicKey);
    params.append('txid', txnId);
    params.append('version', '1');
    
    const reqBody = params.toString();
    const hmacSignature = await createSignature(reqBody, privateKey);
    
    // Make API request to CoinPayments
    const response = await fetch('https://www.coinpayments.net/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmacSignature
      },
      body: reqBody
    });
    
    if (!response.ok) {
      console.error(`CoinPayments API response error: ${response.status}`);
      return {
        error: true,
        status: -1,
        status_text: `API call to CoinPayments failed with status ${response.status}`
      };
    }
    
    const data = await response.json();
    console.log('CoinPayments API response:', JSON.stringify(data));
    
    if (data.error !== 'ok') {
      console.error(`CoinPayments API error: ${data.error}`);
      return {
        error: true,
        status: -1,
        status_text: data.error
      };
    }
    
    // Extract transaction status
    const result = data.result;
    return {
      status: result.status,
      status_text: result.status_text
    };
  } catch (error) {
    console.error('Error checking CoinPayments transaction:', error);
    return {
      error: true,
      status: -1,
      status_text: error.message || 'Unknown error checking transaction'
    };
  }
}

// Check if this is a special test address we should mock responses for
export function isSpecialAddress(address: string | null | undefined): boolean {
  if (!address) return false;
  
  const specialAddresses = [
    'TEST', 
    'TESTADDRESS',
    '0xTEST',
    'TEST123',
  ];
  
  return specialAddresses.some(special => 
    address.toUpperCase().includes(special)
  );
}

// Create a mock completed status response for testing
export function createMockCompletedStatus() {
  return {
    status: 100,
    status_text: 'Complete (Simulated)'
  };
}
