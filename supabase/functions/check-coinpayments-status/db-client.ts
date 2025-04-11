
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Create Supabase client
export function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
}

// Update transaction status in Supabase
export async function updateTransactionStatus(
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
export async function logStatusCheck(
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
