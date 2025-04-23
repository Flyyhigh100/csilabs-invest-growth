
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Creates a Supabase client with service role key
 */
export function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    {
      auth: {
        persistSession: false,
      }
    }
  );
}

/**
 * Saves transaction data to Supabase
 */
export async function saveTransaction(
  supabase: any,
  userId: string,
  amount: number,
  walletAddress: string,
  transactionId: string,
  paymentAddress: string,
  externalTransactionId: string,
  currency: string,
  tokenPrice?: number,
  tokenAmount?: number
) {
  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount,
      payment_method: 'coinpayments',
      wallet_address: walletAddress,
      transaction_id: transactionId,
      payment_address: paymentAddress,
      external_transaction_id: externalTransactionId,
      status: 'pending',
      currency,
      token_price: tokenPrice || 1.00,
      token_amount: tokenAmount || amount
    });

  if (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
}

/**
 * Updates transaction status in Supabase
 */
export async function updateTransactionStatus(
  supabase: any,
  transactionId: string,
  status: string
) {
  const { error } = await supabase
    .from('transactions')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('transaction_id', transactionId);

  if (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
}
