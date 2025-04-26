
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Create a Supabase client
 */
export function createSupabaseClient(token?: string) {
  try {
    // Get Supabase URL and key from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = token || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    // Create and return client
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
}

/**
 * Save transaction to database
 */
export async function saveTransaction(
  supabaseClient: any,
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
  try {
    console.log(`Saving transaction to database. User: ${userId}, Amount: $${amount}, Wallet: ${walletAddress}`);
    
    // Create transaction record
    const { data: transaction, error } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: userId,
        amount,
        wallet_address: walletAddress,
        transaction_id: transactionId,
        payment_address: paymentAddress,
        external_transaction_id: externalTransactionId,
        payment_method: 'coinpayments',
        status: 'pending',
        currency,
        token_price: tokenPrice || null,
        token_amount: tokenAmount || null
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
    
    console.log(`Transaction saved successfully. ID: ${transaction.id}`);
    return transaction;
  } catch (error) {
    console.error('Error in saveTransaction:', error);
    throw error;
  }
}
