
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
    
    console.log(`Checking CoinPayments transaction with external ID: ${txnId}`);
    console.log(`API key info - Public key length: ${publicKey.length}, Private key length: ${privateKey.length}`);
    
    // Validate transaction ID format (basic check)
    if (!txnId || txnId.length < 8) {
      console.error(`Invalid transaction ID format: ${txnId}`);
      return {
        error: true,
        status: -1,
        status_text: 'Invalid transaction ID format'
      };
    }
    
    // Create request parameters
    const params = new URLSearchParams();
    params.append('cmd', 'get_tx_info');
    params.append('key', publicKey);
    params.append('txid', txnId);
    params.append('version', '1');
    
    const reqBody = params.toString();
    
    // Create HMAC signature
    try {
      const hmacSignature = await createSignature(reqBody, privateKey);
      console.log(`HMAC signature created successfully for txid: ${txnId} (first 10 chars: ${hmacSignature.slice(0,10)}...)`);
      
      // Make API request to CoinPayments with explicit timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      console.log(`Making CoinPayments API request for transaction ${txnId}`);
      console.log(`Request body: ${reqBody}`);
      
      const response = await fetch('https://www.coinpayments.net/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'HMAC': hmacSignature
        },
        body: reqBody,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Handle response
      if (!response.ok) {
        console.error(`CoinPayments API response error: ${response.status}, ${response.statusText}`);
        return {
          error: true,
          status: -1,
          status_text: `API call to CoinPayments failed with status ${response.status}: ${response.statusText}`
        };
      }
      
      // Parse JSON response
      const data = await response.json();
      console.log('CoinPayments API raw response:', JSON.stringify(data));
      
      // Check for API errors
      if (data.error !== 'ok') {
        console.error(`CoinPayments API error: ${data.error}`);
        
        // Check for specific API key errors
        if (data.error?.toLowerCase().includes('hmac signature') || 
            data.error?.toLowerCase().includes('invalid key') || 
            data.error?.toLowerCase().includes('permissions')) {
            
          return {
            error: true,
            status: -1,
            status_text: `API key error: ${data.error}`,
            api_key_issue: true
          };
        }
        
        return {
          error: true,
          status: -1,
          status_text: data.error
        };
      }
      
      // Extract transaction status
      const result = data.result;
      console.log(`CoinPayments transaction status for ${txnId}: ${result.status} (${result.status_text})`);
      
      return {
        status: result.status,
        status_text: result.status_text
      };
    } catch (signatureError) {
      console.error("Error creating HMAC signature or calling API:", signatureError);
      return {
        error: true,
        status: -1,
        status_text: `Failed to create API signature or call API: ${signatureError.message}`
      };
    }
  } catch (error) {
    console.error('Error checking CoinPayments transaction:', error);
    return {
      error: true,
      status: -1,
      status_text: error.message || 'Unknown error checking transaction'
    };
  }
}

// Function to check if this is a special testing address
export function isSpecialAddress(address: string | null): boolean {
  if (!address) return false;
  
  // List of test addresses that should be auto-approved
  const specialAddresses = [
    '0xtest',
    '0xTEST',
    'test',
    'TEST',
    '0x0000',
    '0x0'
  ];
  
  return specialAddresses.some(testAddr => 
    address.toLowerCase().includes(testAddr.toLowerCase())
  );
}

// Function to create a mock "completed" status for testing
export function createMockCompletedStatus() {
  return {
    status: 100,
    status_text: 'Complete (Forced by system)'
  };
}
