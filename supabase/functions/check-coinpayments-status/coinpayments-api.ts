
import { createSignature } from "./utils.ts";

interface CoinPaymentsStatusResponse {
  error: boolean;
  result?: any;
  status?: number;
  status_text?: string;
}

// Special test addresses that should automatically complete when force updating
const TEST_ADDRESSES = [
  'TQ8kL2PgqMNYoFfbXAtGC7k5gPcPcWEqC4',
  'TPZxs7J2y8AG3g5i1GPta1pLmGVHNRbCXZ'
];

// Check if an address is a known test address
export function isSpecialAddress(address: string | null): boolean {
  if (!address) return false;
  return TEST_ADDRESSES.includes(address);
}

// Create a mock completed status for testing
export function createMockCompletedStatus() {
  return {
    error: false,
    status: 100,
    status_text: 'Complete (Test Mode)'
  };
}

// Check a CoinPayments transaction status
export async function checkCoinPaymentsTransaction(txnId: string): Promise<CoinPaymentsStatusResponse> {
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
    
    console.log(`Checking CoinPayments transaction with external ID: ${txnId}`);
    console.log(`API key info - Public key length: ${publicKey.length}, Private key length: ${privateKey.length}`);

    // Prepare request
    const url = 'https://www.coinpayments.net/api.php';
    const body = new URLSearchParams();
    body.append('version', '1');
    body.append('cmd', 'get_tx_info');
    body.append('txid', txnId);
    body.append('key', publicKey);
    
    // Get current timestamp for the request
    const timestamp = Math.floor(Date.now() / 1000);
    body.append('nonce', timestamp.toString());
    
    // Generate HMAC signature
    const hmacSignature = await createSignature(body.toString(), privateKey);
    
    console.log(`Making API request to CoinPayments for transaction: ${txnId}`);
    console.log(`Request params: cmd=get_tx_info, txid=${txnId}, nonce=${timestamp}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmacSignature,
      },
      body: body
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error ${response.status}: ${errorText}`);
      return {
        error: true,
        status: response.status,
        status_text: `API HTTP error: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    console.log(`API response:`, JSON.stringify(data).substring(0, 200) + '...');
    
    // Check for API errors
    if (data.error !== 'ok') {
      console.error(`API error response: ${data.error}`);
      return {
        error: true,
        status: -1,
        status_text: data.error
      };
    }
    
    // Extract transaction data
    const txInfo = data.result;
    
    if (!txInfo) {
      console.error('No transaction info in API response');
      return {
        error: true,
        status: -1,
        status_text: 'No transaction data in API response'
      };
    }
    
    // Log status for clarity
    const statusCode = parseInt(txInfo.status || '-1', 10);
    const statusText = txInfo.status_text || '';
    console.log(`Transaction ${txnId} status info from API: code=${statusCode}, text='${statusText}'`);
    
    // Return the full result object on success
    return {
      error: false,
      result: txInfo
    };

  } catch (error) {
    console.error(`Error checking CoinPayments transaction: ${error.message}`);
    return {
      error: true,
      status: -1,
      status_text: `Exception: ${error.message}`
    };
  }
}
