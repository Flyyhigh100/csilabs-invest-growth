
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  return createClient(supabaseUrl, supabaseKey);
}

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Send 200 OK response immediately
  const response = new Response(JSON.stringify({ success: true }), { 
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });

  try {
    console.log("IPN webhook received");
    
    // Create Supabase client
    const supabase = createSupabaseClient();
    
    // Log the raw request for debugging
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);
    
    // Parse the IPN data - attempt to parse as JSON first, then as form data if that fails
    let ipnData;
    try {
      ipnData = JSON.parse(requestBody);
    } catch (e) {
      // If JSON parsing fails, try to parse as form data
      const formData = new URLSearchParams(requestBody);
      ipnData = {};
      for (const [key, value] of formData.entries()) {
        ipnData[key] = value;
      }
    }
    
    console.log("Processed IPN data:", JSON.stringify(ipnData));
    
    // Log the IPN request to the database for debugging
    try {
      const { data: logEntry, error: logError } = await supabase
        .from('ipn_logs')
        .insert({
          provider: 'coinpayments',
          raw_data: ipnData,
          is_valid: true,
          txn_id: ipnData.txn_id || null,
          status: ipnData.status || null,
          request_body: requestBody
        })
        .select()
        .single();
        
      if (logError) {
        console.error("Error logging IPN:", logError);
      } else {
        console.log("IPN logged with ID:", logEntry.id);
      }
    } catch (logException) {
      console.error("Exception logging IPN:", logException);
    }

    // Extract status code
    const status = parseInt(ipnData.status || '0');

    // Handle all relevant status codes
    if (status === 0) {
      console.log("Transaction is still pending:", ipnData.txn_id);
    } else if (status === 1 || status >= 100) {
      // Status 1 = Confirmed, Status >= 100 = Complete
      const { data, error } = await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('external_transaction_id', ipnData.txn_id);

      if (error) {
        console.error("Database update error:", error);
      } else {
        console.log("Transaction updated successfully:", ipnData.txn_id);
        
        // Add notification for the user
        try {
          // First find the transaction to get the user_id
          const { data: txData, error: txError } = await supabase
            .from('transactions')
            .select('user_id, amount')
            .eq('external_transaction_id', ipnData.txn_id)
            .single();
            
          if (!txError && txData) {
            await supabase
              .from('notifications')
              .insert({
                user_id: txData.user_id,
                type: 'payment_completed',
                title: 'Payment Completed',
                message: `Your cryptocurrency payment of $${txData.amount} has been completed. Tokens will be sent to your wallet shortly.`
              });
          }
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
      }
    } else if (status < 0) {
      // Negative statuses indicate failed transactions
      const { data, error } = await supabase
        .from('transactions')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('external_transaction_id', ipnData.txn_id);

      if (error) {
        console.error("Database update error:", error);
      } else {
        console.log("Transaction marked as failed:", ipnData.txn_id);
        
        // Add notification for the user
        try {
          // First find the transaction to get the user_id
          const { data: txData, error: txError } = await supabase
            .from('transactions')
            .select('user_id, amount')
            .eq('external_transaction_id', ipnData.txn_id)
            .single();
            
          if (!txError && txData) {
            await supabase
              .from('notifications')
              .insert({
                user_id: txData.user_id,
                type: 'payment_failed',
                title: 'Payment Failed',
                message: `Your cryptocurrency payment of $${txData.amount} has failed or been cancelled.`
              });
          }
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
      }
    }
  } catch (error) {
    console.error("Error processing IPN:", error);
  }

  return response;
});
