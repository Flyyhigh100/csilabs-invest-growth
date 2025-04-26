
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

/**
 * Create a Supabase client with the service role key for database operations
 */
export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Save transaction details to the database
 */
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
    
    // First, attempt to save with token price and amount
    if (tokenPrice && tokenAmount) {
      const { data, error } = await supabaseClient
        .from('transactions')
        .insert([
          {
            user_id: userId,
            amount: amount,
            wallet_address: walletAddress,
            transaction_id: transactionId,
            payment_address: paymentAddress,
            external_transaction_id: externalId,
            payment_method: 'coinpayments',
            status: 'pending',
            currency: currency,
            token_price: tokenPrice,
            token_amount: tokenAmount
          }
        ])
        .select()
        .single();
        
      if (error) {
        console.error('Error saving transaction with token data:', error);
        // If error involves token_price or token_amount, try without those fields
        if (error.message.includes('token_price') || error.message.includes('token_amount')) {
          console.log('Retrying transaction save without token fields');
          return await saveTransactionWithoutTokenData(
            supabaseClient, userId, amount, walletAddress, transactionId, 
            paymentAddress, externalId, currency
          );
        }
        throw error;
      }
      
      return data;
    } else {
      // If no token price/amount provided, save without those fields
      return await saveTransactionWithoutTokenData(
        supabaseClient, userId, amount, walletAddress, transactionId, 
        paymentAddress, externalId, currency
      );
    }
  } catch (error) {
    console.error('Error in saveTransaction:', error);
    throw error;
  }
}

/**
 * Fallback function to save transaction without token data
 * Used when the token_price and token_amount columns might not exist
 */
async function saveTransactionWithoutTokenData(
  supabaseClient: any,
  userId: string,
  amount: number,
  walletAddress: string,
  transactionId: string,
  paymentAddress: string,
  externalId: string,
  currency: string
) {
  const { data, error } = await supabaseClient
    .from('transactions')
    .insert([
      {
        user_id: userId,
        amount: amount,
        wallet_address: walletAddress,
        transaction_id: transactionId,
        payment_address: paymentAddress,
        external_transaction_id: externalId,
        payment_method: 'coinpayments',
        status: 'pending',
        currency: currency
      }
    ])
    .select()
    .single();
    
  if (error) {
    console.error('Error saving transaction without token data:', error);
    throw error;
  }
  
  return data;
}
