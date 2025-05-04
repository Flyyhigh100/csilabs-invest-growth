
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Extract parameters
    const { transactionId, status = '100', amount } = requestBody;
    
    if (!transactionId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required field: transactionId' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    console.log(`Processing test IPN webhook for transaction: ${transactionId}`);
    
    // Get the transaction from database
    const supabase = createSupabaseClient();
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('external_transaction_id', transactionId)
      .maybeSingle();
    
    if (txError || !transaction) {
      console.error('Error fetching transaction:', txError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: txError ? `Database error: ${txError.message}` : `Transaction not found with external ID: ${transactionId}` 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    console.log(`Found transaction in database:`, JSON.stringify(transaction));
    
    // Create test IPN notification data
    const ipnData = {
      ipn_version: '1.0',
      ipn_type: 'api',
      ipn_mode: 'hmac',
      ipn_id: `TEST_${Date.now()}`,
      merchant: Deno.env.get('COINPAYMENTS_MERCHANT_ID') || 'test_merchant',
      ipn_secret: Deno.env.get('COINPAYMENTS_IPN_SECRET') || 'test_secret',
      txn_id: transactionId,
      status: status,
      status_text: status === '100' ? 'Complete' : status === '2' ? 'Pending' : 'Waiting for payment',
      amount1: amount || transaction.amount,
      amount2: amount || transaction.amount,
      currency1: 'USD',
      currency2: transaction.currency || 'USDT',
      buyer_name: 'Test User',
      buyer_email: 'test@example.com',
      received_amount: amount || transaction.amount,
      received_confirms: '3',
      payment_address: transaction.payment_address || '0xabcdef1234567890',
      custom: transaction.wallet_address || null
    };
    
    // Send the test IPN notification to our webhook
    try {
      console.log('Sending test IPN notification to webhook:', JSON.stringify(ipnData));
      
      const webhookResponse = await fetch(
        'https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/coinpayments-ipn-webhook', 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(ipnData).toString()
        }
      );
      
      const webhookResult = await webhookResponse.text();
      console.log(`Webhook response (${webhookResponse.status}):`, webhookResult);
      
      // Call status update edge function to ensure transaction is processed
      console.log('Triggering status check to update transaction');
      const statusCheckResponse = await fetch(
        'https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/check-coinpayments-status',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}` 
          },
          body: JSON.stringify({ 
            transactionId: transaction.id,
            external_transaction_id: transactionId,
            forceUpdate: true
          })
        }
      );
      
      const statusUpdateResult = await statusCheckResponse.json();
      console.log('Status check response:', JSON.stringify(statusUpdateResult));
      
      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Test IPN notification sent successfully',
          webhookStatus: webhookResponse.status,
          statusUpdateResult: statusUpdateResult
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } catch (webhookError) {
      console.error('Error sending test IPN notification:', webhookError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error sending test IPN notification: ${webhookError.message}` 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  } catch (error) {
    console.error('Unhandled exception:', error);
    return new Response(
      JSON.stringify({ success: false, message: `Internal server error: ${error.message || 'Unknown error'}` }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
