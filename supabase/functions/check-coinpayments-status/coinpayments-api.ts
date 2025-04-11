
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
    
    // Add more extensive error handling for signature creation
    let hmacSignature;
    try {
      hmacSignature = await createSignature(reqBody, privateKey);
      console.log(`HMAC signature created successfully for txid: ${txnId}`);
    } catch (signatureError) {
      console.error("Error creating HMAC signature:", signatureError);
      return {
        error: true,
        status: -1,
        status_text: `Failed to create API signature: ${signatureError.message}`
      };
    }
    
    console.log(`Making API request to CoinPayments with txid: ${txnId}`);
    
    // Make API request to CoinPayments with timeout and retries
    let response;
    let retries = 0;
    const MAX_RETRIES = 2;
    
    while (retries <= MAX_RETRIES) {
      try {
        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        response = await fetch('https://www.coinpayments.net/api.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'HMAC': hmacSignature
          },
          body: reqBody,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Break the loop if successful
        break;
      } catch (fetchError) {
        retries++;
        
        if (fetchError.name === 'AbortError') {
          console.error(`CoinPayments API request timeout (attempt ${retries})`);
          
          if (retries > MAX_RETRIES) {
            return {
              error: true,
              status: -1,
              status_text: 'API request timed out after multiple attempts'
            };
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }
        
        console.error(`CoinPayments API fetch error (attempt ${retries}):`, fetchError);
        
        if (retries > MAX_RETRIES) {
          return {
            error: true,
            status: -1,
            status_text: `API fetch error: ${fetchError.message}`
          };
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
    
    // Check API response
    if (!response || !response.ok) {
      const status = response ? response.status : 'no response';
      const statusText = response ? response.statusText : 'connection failed';
      
      console.error(`CoinPayments API response error: ${status}, ${statusText}`);
      
      // Try to parse error response if possible
      let errorBody = 'Could not read response body';
      try {
        if (response) {
          errorBody = await response.text();
          console.error('Error response body:', errorBody);
        }
      } catch (e) {
        console.error('Could not parse error response body');
      }
      
      return {
        error: true,
        status: -1,
        status_text: `API call to CoinPayments failed with status ${status}: ${statusText}. Response: ${errorBody}`
      };
    }
    
    // Parse JSON response with extra error handling
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON from CoinPayments API:', jsonError);
      
      // Try to get the raw text
      const responseText = await response.text();
      return {
        error: true,
        status: -1,
        status_text: `Failed to parse API response: ${jsonError.message}. Raw response: ${responseText.substring(0, 100)}`
      };
    }
    
    console.log('CoinPayments API raw response:', JSON.stringify(data));
    
    // Validate response format
    if (!data || typeof data !== 'object') {
      return {
        error: true,
        status: -1,
        status_text: 'Invalid response format from CoinPayments API'
      };
    }
    
    if (data.error !== 'ok') {
      console.error(`CoinPayments API error: ${data.error}`);
      return {
        error: true,
        status: -1,
        status_text: data.error
      };
    }
    
    // Make sure result exists and contains status
    if (!data.result || typeof data.result !== 'object' || 
        data.result.status === undefined || data.result.status_text === undefined) {
      console.error('Missing expected fields in CoinPayments API response');
      return {
        error: true,
        status: -1,
        status_text: 'Invalid response structure from CoinPayments API'
      };
    }
    
    // Extract transaction status
    const result = data.result;
    console.log(`CoinPayments transaction status for ${txnId}: ${result.status} (${result.status_text})`);
    
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

// Check if this is a special address we should mock responses for
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
