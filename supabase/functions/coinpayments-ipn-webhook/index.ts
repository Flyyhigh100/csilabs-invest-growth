
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createDbClient } from "./db-client.ts";
import { logIpnRequest } from "./logging.ts";
import { mapCoinPaymentsStatus } from "./status-mapper.ts";
import { createPaymentConfirmationNotification } from "./notification.ts";

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    
    console.log("Processed IPN data:", JSON.stringify(ipnData));
    
    // Update the log entry with the parsed data
    if (ipnLogEntry?.id) {
      console.log("Updating IPN log entry with parsed data");
      const { error: updateLogError } = await supabase
        .from('ipn_logs')
        .update({
          raw_data: ipnData,
          txn_id: ipnData.txn_id || null,
          status: ipnData.status || null,
          verification_status: 'processed',
          processing_status: 'processing',
          processed_at: new Date().toISOString()
        })
        .eq('id', ipnLogEntry.id);
        
      if (updateLogError) {
        console.error("Error updating IPN log entry:", updateLogError);
      } else {
        console.log("IPN log entry updated successfully");
      }
    }

    // Extract status code and map to our internal statuses
    const statusCode = parseInt(ipnData.status || '0', 10);
    const mappedStatus = mapCoinPaymentsStatus(statusCode);
    
    console.log(`CoinPayments status: ${statusCode}, Mapped to internal status: ${mappedStatus}`);

    // First, find the transaction in our database
    console.log(`Looking up transaction with external ID: ${ipnData.txn_id}`);
    const { data: transaction, error: findError } = await supabase
      .from('transactions')
      .select('id, user_id, amount, status')
      .eq('external_transaction_id', ipnData.txn_id)
      .single();
      
    if (findError) {
      console.error(`Database lookup error for txn_id ${ipnData.txn_id}:`, findError);
      
      // Update the log with the error
      if (ipnLogEntry?.id) {
        await supabase
          .from('ipn_logs')
          .update({
            error_message: `Transaction lookup failed: ${findError.message}`,
            processing_status: 'failed',
            details: { error: findError }
          })
          .eq('id', ipnLogEntry.id);
      }
      
      // Return the response, but the webhook still succeeds because we want to acknowledge receipt
      return response;
    }
    
    if (!transaction) {
      console.error(`No transaction found with external_transaction_id: ${ipnData.txn_id}`);
      
      // Try looking up by payment_address if available
      if (ipnData.address) {
        console.log(`Trying fallback lookup by payment_address: ${ipnData.address}`);
        const { data: addrTransaction, error: addrError } = await supabase
          .from('transactions')
          .select('id, user_id, amount, status')
          .eq('payment_address', ipnData.address)
          .single();
          
        if (!addrError && addrTransaction) {
          console.log(`Successfully found transaction by payment_address: ${addrTransaction.id}`);
          
          // Update with external_transaction_id since we now know it
          const { error: updateError } = await supabase
            .from('transactions')
            .update({
              external_transaction_id: ipnData.txn_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', addrTransaction.id);
            
          if (updateError) {
            console.error(`Error updating transaction with external ID: ${updateError.message}`);
          } else {
            console.log(`Updated transaction ${addrTransaction.id} with external_transaction_id: ${ipnData.txn_id}`);
            
            // Continue processing with the found transaction
            await processTransaction(
              supabase, 
              addrTransaction, 
              mappedStatus, 
              ipnData, 
              ipnLogEntry,
              statusCode
            );
            
            return response;
          }
        }
      }
      
      // Update the log with the information
      if (ipnLogEntry?.id) {
        await supabase
          .from('ipn_logs')
          .update({
            error_message: `No transaction found with external_transaction_id: ${ipnData.txn_id}`,
            processing_status: 'failed',
            details: { error: 'Transaction not found', lookupValue: ipnData.txn_id }
          })
          .eq('id', ipnLogEntry.id);
      }
      
      // Return the response, but the webhook still succeeds
      return response;
    }
    
    console.log(`Found transaction in database: ${transaction.id}, current status: ${transaction.status}`);
    
    // Process the transaction with the mapped status
    await processTransaction(
      supabase, 
      transaction, 
      mappedStatus, 
      ipnData, 
      ipnLogEntry,
      statusCode
    );
    
    console.log("IPN webhook processing completed successfully");
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

// Helper function to process a transaction update
async function processTransaction(
  supabase: any, 
  transaction: any, 
  mappedStatus: string, 
  ipnData: any, 
  ipnLogEntry: any,
  originalStatusCode: number
) {
  try {
    // Only update if the status is different
    if (transaction.status !== mappedStatus) {
      console.log(`Updating transaction ${transaction.id} status from ${transaction.status} to ${mappedStatus}`);
      
      const updateData: Record<string, any> = { 
        status: mappedStatus,
        updated_at: new Date().toISOString()
      };
      
      // Add completed_at if the transaction is being marked as completed
      if (mappedStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      // Update the transaction status
      const { data: updatedTx, error: updateError } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transaction.id)
        .select()
        .single();

      if (updateError) {
        console.error(`Database update error for transaction ${transaction.id}:`, updateError);
        
        // Update the log with the error
        if (ipnLogEntry?.id) {
          await supabase
            .from('ipn_logs')
            .update({
              error_message: `Transaction update failed: ${updateError.message}`,
              processing_status: 'failed',
              details: { error: updateError }
            })
            .eq('id', ipnLogEntry.id);
        }
      } else {
        console.log(`Transaction ${transaction.id} updated successfully to status: ${mappedStatus}`);
        
        // Update the log with success
        if (ipnLogEntry?.id) {
          await supabase
            .from('ipn_logs')
            .update({
              processing_status: 'completed',
              details: { 
                transaction_id: transaction.id,
                old_status: transaction.status,
                new_status: mappedStatus,
                original_status_code: originalStatusCode
              },
              is_valid: true,
              response_status: 'Transaction updated successfully'
            })
            .eq('id', ipnLogEntry.id);
        }
        
        // Create notification for the user based on new status
        await createNotification(supabase, transaction, mappedStatus);
      }
    } else {
      console.log(`No status change needed for transaction ${transaction.id}, already ${transaction.status}`);
      // Update the log with the information that no change was needed
      if (ipnLogEntry?.id) {
        await supabase
          .from('ipn_logs')
          .update({
            processing_status: 'completed',
            details: { 
              transaction_id: transaction.id,
              status: transaction.status,
              original_status_code: originalStatusCode,
              no_change_needed: true
            },
            is_valid: true,
            response_status: 'Transaction already has the correct status'
          })
          .eq('id', ipnLogEntry.id);
      }
    }
  } catch (error) {
    console.error(`Error processing transaction ${transaction.id}:`, error);
    
    // Update the log with the error
    if (ipnLogEntry?.id) {
      await supabase
        .from('ipn_logs')
        .update({
          error_message: `Error processing transaction: ${error.message}`,
          processing_status: 'error',
          details: { error }
        })
        .eq('id', ipnLogEntry.id);
    }
  }
}

// Helper function to create appropriate notifications
async function createNotification(supabase: any, transaction: any, status: string) {
  try {
    console.log(`Creating ${status} notification for user ${transaction.user_id}`);
    
    let notificationData = {
      user_id: transaction.user_id,
      type: `payment_${status}`,
      title: '',
      message: ''
    };
    
    if (status === 'completed') {
      notificationData.title = 'Payment Completed';
      notificationData.message = `Your cryptocurrency payment of $${transaction.amount} has been completed. Tokens will be sent to your wallet shortly.`;
    } else if (status === 'confirmed') {
      notificationData.title = 'Payment Confirmed';
      notificationData.message = `Your cryptocurrency payment of $${transaction.amount} has been confirmed. It is being processed now.`;
    } else if (status === 'failed') {
      notificationData.title = 'Payment Failed';
      notificationData.message = `Your cryptocurrency payment of $${transaction.amount} has failed or been cancelled.`;
    } else {
      notificationData.title = 'Payment Status Update';
      notificationData.message = `Your cryptocurrency payment of $${transaction.amount} status has been updated to ${status}.`;
    }
    
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();
      
    if (notifError) {
      console.error(`Error creating notification for user ${transaction.user_id}:`, notifError);
      return false;
    }
    
    console.log(`Successfully created notification ID ${notification?.id || 'unknown'} for user ${transaction.user_id}`);
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}
