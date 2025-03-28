
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Create Supabase client
export function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
}

// Save transaction to database
export async function saveTransaction(
  supabaseClient: any,
  userId: string,
  amount: number,
  walletAddress: string,
  transactionId: string,
  paymentAddress: string,
  externalTransactionId: string,
  currency?: string
) {
  try {
    // First, check if the transactions table has the currency column
    const { error: tablesError } = await supabaseClient
      .from('transactions')
      .select('currency')
      .limit(1);
    
    // If there's no currency column, log it but continue without trying to use it
    const hasCurrencyColumn = !tablesError;
    
    // Construct the insert object based on column availability
    const insertData: any = {
      user_id: userId,
      amount: amount,
      wallet_address: walletAddress,
      payment_method: 'coinpayments',
      status: 'pending',
      transaction_id: transactionId,
      payment_address: paymentAddress,
      external_transaction_id: externalTransactionId,
    };
    
    // Only add currency if the column exists
    if (hasCurrencyColumn && currency) {
      insertData.currency = currency;
    }
    
    // Insert the transaction record
    const { error: insertError } = await supabaseClient
      .from('transactions')
      .insert(insertData);

    if (insertError) {
      console.error('Error inserting transaction record:', insertError);
      throw new Error('Failed to record transaction');
    }
    
    return true;
  } catch (dbError) {
    console.error('Database operation error:', dbError);
    throw dbError;
  }
}
