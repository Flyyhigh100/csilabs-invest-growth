
import { createDbClient } from "./db-client.ts";

// Log an IPN request for debugging and tracking
export async function logIpnRequest(request: Request): Promise<any> {
  try {
    // Clone the request to preserve its body for other uses
    const clonedRequest = request.clone();
    
    // Get raw body for logging
    let rawBody = '';
    try {
      rawBody = await clonedRequest.text();
    } catch (e) {
      console.error('Error getting raw body:', e);
      rawBody = 'Error reading body: ' + e.message;
    }
    
    // Get HMAC header
    const hmacHeader = request.headers.get('HMAC') || 'No HMAC header';
    
    // Parse content type
    const contentType = request.headers.get('content-type') || 'unknown';
    
    // Prepare data for logging
    let parsedData: any = {};
    try {
      if (contentType.includes('application/json')) {
        parsedData = JSON.parse(rawBody);
      } else if (contentType.includes('application/x-www-form-urlencoded') || 
                contentType.includes('multipart/form-data')) {
        // For form data, we'll have to parse in the main handler
        parsedData = { 
          contentType,  
          note: 'Form data will be parsed in the main handler'
        };
      } else {
        parsedData = { 
          contentType, 
          rawBodySample: rawBody.substring(0, 100) + (rawBody.length > 100 ? '...' : '') 
        };
      }
    } catch (e) {
      console.error('Error parsing request body:', e);
      parsedData = { error: 'Error parsing request body: ' + e.message };
    }
    
    console.log(`Logging IPN request: ${contentType}`);
    
    // Create Supabase client
    const supabase = createDbClient();
    
    // Insert log entry
    const { data: logEntry, error } = await supabase
      .from('ipn_logs')
      .insert({
        provider: 'coinpayments',
        raw_data: parsedData,
        is_valid: false, // Will update this after verification
        response_status: 'Pending processing',
        hmac_header: hmacHeader,
        request_body: rawBody,
        verification_status: 'pending',
        request_headers: JSON.stringify(Object.fromEntries(request.headers)),
        source_ip: request.headers.get('x-forwarded-for') || 'unknown',
        processing_status: 'received',
        timestamp: new Date().toISOString(),
        error_category: null,
        error_message: null,
        received_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error logging IPN request:', error);
      return null;
    }
    
    return logEntry;
  } catch (error) {
    console.error('Exception in logIpnRequest:', error);
    return null;
  }
}
