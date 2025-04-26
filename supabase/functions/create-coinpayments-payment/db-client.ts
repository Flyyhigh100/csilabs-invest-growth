
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function saveTransaction(
  supabaseClient: any,
  userId: string,
  amount: number,
  walletAddress: string,
  transactionId: string,
  paymentAddress: string,
  externalId: string,
  currency: string,
  tokenPrice?: number,
  tokenAmount?: number
) {
  try {
    console.log(`Saving transaction to database:
      userId: ${userId}
      amount: ${amount}
      walletAddress: ${walletAddress}
      transactionId: ${transactionId}
      paymentAddress: ${paymentAddress}
      externalId: ${externalId}
      currency: ${currency}
      tokenPrice: ${tokenPrice}
      tokenAmount: ${tokenAmount}
    `);
    
    const transactionData = {
      user_id: userId,
      amount: amount,
      wallet_address: walletAddress,
      transaction_id: transactionId,
      payment_address: paymentAddress,
      external_transaction_id: externalId,
      payment_method: 'coinpayments',
      status: 'pending',
      currency: currency,
      token_price: tokenPrice || null,
      token_amount: tokenAmount || null
    };

    const { data, error } = await supabaseClient
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();
      
    if (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
    
    console.log('Successfully saved transaction:', data);
    return data;
  } catch (err) {
    console.error('Exception in saveTransaction:', err);
    throw err;
  }
}

