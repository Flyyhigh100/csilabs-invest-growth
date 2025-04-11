
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSignature, corsHeaders } from "./utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Create Supabase client
function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
}

const COINPAYMENTS_API_URL = 'https://www.coinpayments.net/api.php';
const COINPAYMENTS_PUBLIC_KEY = Deno.env.get('COINPAYMENTS_PUBLIC_KEY');
const COINPAYMENTS_PRIVATE_KEY = Deno.env.get('COINPAYMENTS_PRIVATE_KEY');

// Helper function to make CoinPayments API request
async function coinPaymentsRequest(command: string, params: Record<string, string>) {
  if (!COINPAYMENTS_PUBLIC_KEY || !COINPAYMENTS_PRIVATE_KEY) {
    throw new Error('CoinPayments API keys are not configured');
  }

  const requestParams = {
    cmd: command,
    key: COINPAYMENTS_PUBLIC_KEY,
    version: '1',
    format: 'json',
    ...params,
  };

  const hmacSig = await createSignature(requestParams, COINPAYMENTS_PRIVATE_KEY);

  console.log(`Making CoinPayments API request for command: ${command}`);
  
  try {
    const response = await fetch(COINPAYMENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmacSig,
      },
      body: new URLSearchParams(requestParams),
    });

    const data = await response.json();
    
    console.log("CoinPayments API response:", data);
    
    if (data.error !== 'ok') {
      console.error('CoinPayments API error:', data.error);
      throw new Error(`CoinPayments API error: ${data.error}`);
    }

    return data.result;
  } catch (error) {
    console.error('Error in API request:', error);
    throw error;
  }
}

// Check transaction status from CoinPayments
async function checkCoinPaymentsTransaction(txId: string) {
  try {
    // For demo/test mode, simulate status updates
    if (txId.startsWith('MOCK') || !COINPAYMENTS_PUBLIC_KEY) {
      // Generate a random status based on the transaction ID
      // This will help simulate different status responses for testing
      const hash = Array.from(txId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const mockStatuses = [0, 100, 100]; // Higher chance of "completed" status
      const statusCode = mockStatuses[hash % mockStatuses.length];
      
      return {
        status: statusCode,
        status_text: statusCode === 0 ? 'Pending' : 'Complete',
        time_completed: statusCode >= 100 ? new Date().toISOString() : null
      };
    }
    
    // Make real API request to CoinPayments
    const result = await coinPaymentsRequest('get_tx_info', { txid: txId });
    console.log(`Transaction ${txId} status from CoinPayments:`, result);
    return result;
  } catch (error) {
    console.error(`Error checking CoinPayments transaction ${txId}:`, error);
    throw error;
  }
}

// Update transaction status in Supabase
async function updateTransactionStatus(
  client: any, 
  transactionId: string, 
  status: string,
  completedAt?: string
) {
  try {
    const updateData: Record<string, any> = {
      status: status,
      updated_at: new Date().toISOString()
    };
    
    if (completedAt) {
      updateData.completed_at = completedAt;
    }
    
    console.log(`Updating transaction ${transactionId} to status: ${status}`);
    
    const { error } = await client
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId);
      
    if (error) {
      console.error(`Error updating transaction ${transactionId}:`, error);
      throw error;
    }
    
    console.log(`Successfully updated transaction ${transactionId} status to ${status}`);
    return true;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
}

// Log status check to the ipn_logs table
async function logStatusCheck(
  client: any,
  transactionId: string,
  externalTxId: string,
  paymentStatus: any,
  newStatus: string,
  updated: boolean,
  forceUpdate: boolean
) {
  try {
    await client
      .from('ipn_logs')
      .insert({
        provider: 'coinpayments_status_check',
        txn_id: externalTxId,
        status: newStatus,
        raw_data: {
          transaction_id: transactionId,
          external_transaction_id: externalTxId,
          payment_status: paymentStatus,
          new_status: newStatus,
          updated: updated,
          force_update: forceUpdate
        },
        is_valid: true,
        response_status: updated ? 'Updated' : 'No change needed'
      });
  } catch (error) {
    console.error('Error logging status check:', error);
    // Don't throw, just log the error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Parse request data
    const { transactionId, forceUpdate } = await req.json();
    
    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: 'Transaction ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Checking status for transaction: ${transactionId}, forceUpdate: ${forceUpdate}`);
    
    const supabaseClient = createSupabaseClient();

    // Get the transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .select('external_transaction_id, status')
      .eq('id', transactionId)
      .single();
      
    if (transactionError || !transaction) {
      console.error('Error fetching transaction:', transactionError);
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // No need to check if already completed, unless force update is requested
    if (transaction.status === 'completed' && !forceUpdate) {
      console.log(`Transaction ${transactionId} is already completed, skipping check`);
      return new Response(
        JSON.stringify({ status: 'completed', updated: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Check with CoinPayments API
    const externalTxId = transaction.external_transaction_id;
    if (!externalTxId) {
      console.error(`No external transaction ID found for transaction ${transactionId}`);
      return new Response(
        JSON.stringify({ error: 'No external transaction ID found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const paymentStatus = await checkCoinPaymentsTransaction(externalTxId);
    console.log(`Status for ${externalTxId}:`, paymentStatus);
    
    // Map CoinPayments status to our status
    // Status codes: https://www.coinpayments.net/merchant-tools-ipn
    // -1 = Error/canceled
    // 0 = Pending
    // 1 = Partial payment received
    // 2 = Complete
    // 3 = Confirmed (3+ confirmations)
    // 100 = Complete/Confirmed
    let newStatus = transaction.status;
    let updated = false;
    
    if (paymentStatus.status < 0) {
      newStatus = 'failed';
      updated = true;
    } else if (paymentStatus.status === 0) {
      newStatus = 'pending';
    } else if (paymentStatus.status >= 1) {
      // IMPORTANT: All values >= 1 should be considered completed
      newStatus = 'completed';
      updated = true;
    }
    
    // Log the status check regardless of the outcome
    await logStatusCheck(
      supabaseClient,
      transactionId,
      externalTxId,
      paymentStatus,
      newStatus,
      (updated && newStatus !== transaction.status) || forceUpdate,
      !!forceUpdate
    );
    
    // Update transaction if status changed or force update requested
    if ((updated && newStatus !== transaction.status) || forceUpdate) {
      await updateTransactionStatus(
        supabaseClient, 
        transactionId, 
        newStatus, 
        paymentStatus.time_completed || new Date().toISOString()
      );
      
      console.log(`Updated transaction ${transactionId} status to ${newStatus}`);
      updated = true;
    }
    
    return new Response(
      JSON.stringify({
        status: newStatus,
        updated,
        external_status: paymentStatus.status,
        external_status_text: paymentStatus.status_text || '',
        message: updated ? `Status updated to ${newStatus}` : 'Status not changed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
