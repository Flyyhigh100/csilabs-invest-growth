
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createDbClient } from "./db-client.ts";
import { logIpnRequest } from "./logging.ts";
import { mapCoinPaymentsStatus } from "./status-mapper.ts";
import { createPaymentConfirmationNotification } from "./notification.ts";
import { processIpnPayload } from "./transaction-handler.ts";

serve(async (req) => {
  console.log("CoinPayments IPN webhook received - Request method:", req.method);
  console.log("Request headers:", JSON.stringify(Object.fromEntries(req.headers)));
  
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }
  
  // Send 200 OK response immediately to satisfy CoinPayments requirement
  const response = new Response(JSON.stringify({ success: true }), { 
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
  
  let ipnLogEntry = null;

  try {
    console.log("=========== IPN WEBHOOK RECEIVED ===========");
    
    // Log the incoming request first thing
    ipnLogEntry = await logIpnRequest(req);
    console.log(`Created IPN log entry with ID: ${ipnLogEntry?.id || 'unknown'}`);
    
    // Create Supabase client
    const supabase = createDbClient();
    
    // Clone the request to read the body
    const clonedRequest = req.clone();
    
    // Log the raw request for debugging
    const requestBody = await clonedRequest.text();
    console.log(`Raw request body (${requestBody.length} bytes):`);
    console.log(requestBody.substring(0, 1000) + (requestBody.length > 1000 ? '...(truncated)' : ''));
    
    // Parse the IPN data - attempt to parse as JSON first, then as form data if that fails
    let ipnData;
    try {
      console.log("Attempting to parse as JSON...");
      ipnData = JSON.parse(requestBody);
    } catch (e) {
      console.log("JSON parse failed, trying to parse as form data:", e.message);
      // If JSON parsing fails, try to parse as form data
      const formData = new URLSearchParams(requestBody);
      ipnData = {};
      for (const [key, value] of formData.entries()) {
        ipnData[key] = value;
      }
      console.log("Parsed as form data successfully");
    }
    
    // Verify HMAC signature if provided
    const hmacHeader = req.headers.get('HMAC');
    const ipnSecret = Deno.env.get('COINPAYMENTS_IPN_SECRET');
    
    let isVerified = false;
    
    if (hmacHeader && ipnSecret) {
      console.log("Verifying IPN signature...");
      // Calculate expected HMAC
      const hmac = createHmac('sha512', ipnSecret);
      hmac.update(requestBody);
      const expectedSignature = hmac.digest('hex');
      
      isVerified = hmacHeader === expectedSignature;
      console.log(`IPN signature verification: ${isVerified ? 'SUCCESS' : 'FAILED'}`);
    } else {
      console.log("No HMAC signature found or IPN secret not configured");
    }
    
    console.log("Processed IPN data:", JSON.stringify(ipnData));
    
    // Update the log entry with the parsed data and processing details
    if (ipnLogEntry?.id) {
      console.log("Updating IPN log entry with parsed data");
      const { error: updateLogError } = await supabase
        .from('ipn_logs')
        .update({
          raw_data: ipnData,
          txn_id: ipnData.txn_id || null,
          status: ipnData.status || null,
          verification_status: isVerified ? 'verified' : 'unverified',
          processing_status: 'processing',
          processed_at: new Date().toISOString(),
          details: { 
            ipn_type: ipnData.ipn_type || 'unknown',
            request_method: req.method,
            source_ip: req.headers.get('x-forwarded-for') || 'unknown',
            hmac_verified: isVerified
          },
          request_headers: JSON.stringify(Object.fromEntries(req.headers))
        })
        .eq('id', ipnLogEntry.id);
        
      if (updateLogError) {
        console.error("Error updating IPN log entry:", updateLogError);
      } else {
        console.log("IPN log entry updated successfully with parsed data");
      }
    }

    // Process the IPN data and update transaction status
    const result = await processIpnPayload(ipnData, ipnLogEntry?.id);
    
    console.log("IPN processing result:", JSON.stringify(result));
    
    // Update the log entry with the final processing result
    if (ipnLogEntry?.id) {
      const finalStatus = result.success ? 'completed' : 'failed';
      
      await supabase
        .from('ipn_logs')
        .update({
          processing_status: finalStatus,
          is_valid: result.success,
          response_status: result.message,
          details: { 
            ...ipnLogEntry.details,
            result: result
          }
        })
        .eq('id', ipnLogEntry.id);
    }
    
    console.log("IPN webhook processing completed");
  } catch (error) {
    console.error("Unhandled exception processing IPN:", error);
    
    // Try to update the log with the error if possible
    try {
      if (ipnLogEntry?.id) {
        const supabase = createDbClient();
        await supabase
          .from('ipn_logs')
          .update({
            error_message: `Unhandled exception: ${error.message || 'Unknown error'}`,
            processing_status: 'error',
            error_category: 'unhandled_exception',
            details: { 
              stack: error.stack,
              message: error.message
            }
          })
          .eq('id', ipnLogEntry.id);
      }
    } catch (logError) {
      console.error("Failed to update log with error:", logError);
    }
  }

  console.log("Returning 200 OK response to CoinPayments");
  return response;
});
