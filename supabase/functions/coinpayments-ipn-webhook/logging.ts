
import { createDbClient } from "./db-client.ts";

// Log IPN request for debugging and auditing
export async function logIpnRequest(request: Request): Promise<any> {
  try {
    const dbClient = createDbClient();
    const clonedRequest = request.clone();
    
    // Extract request body for logging
    let requestBody = '';
    try {
      requestBody = await clonedRequest.text();
    } catch (e) {
      console.error('Could not read request body:', e);
      requestBody = 'Error reading request body';
    }
    
    // Get the HMAC header for verification debugging
    const hmacHeader = request.headers.get('HMAC') || 'No HMAC header found';
    
    // Create log entry
    const { data, error } = await dbClient
      .from('ipn_logs')
      .insert({
        provider: 'coinpayments',
        raw_data: {}, // Will be filled with parsed data later
        is_valid: false, // Initial value, will be updated after verification
        response_status: 'Received',
        hmac_header: hmacHeader,
        request_body: requestBody
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error logging IPN request:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in logIpnRequest:', error);
    return null;
  }
}
