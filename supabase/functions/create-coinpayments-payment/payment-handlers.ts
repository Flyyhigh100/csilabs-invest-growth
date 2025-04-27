
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { createCryptoPayment } from "./crypto-service.ts";

/**
 * Handle crypto payment request
 */
export async function handleCryptoPaymentRequest(
  authHeader: string,
  amount: number, 
  walletAddress: string, 
  currency: string = 'USDT',
  tokenPrice?: number,
  tokenAmount?: number
) {
  try {
    console.log(`Handling crypto payment request for ${walletAddress} (${currency})`);
    
    // Create a crypto payment
    const payment = await createCryptoPayment(amount, walletAddress, currency, tokenPrice);
    
    if (!payment.success) {
      console.error("Failed to create crypto payment:", payment.message);
      return payment;
    }
    
    // Create a Supabase client for storing the transaction
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration");
      return {
        ...payment,
        message: "Warning: Could not store transaction in database (missing Supabase configuration)"
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Extract user ID from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData?.user) {
      console.error("Error getting user data:", userError);
      return {
        ...payment,
        message: "Warning: Could not store transaction in database (user authentication error)"
      };
    }
    
    // Create unique transaction ID
    const transactionId = `cp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Store the transaction in the database
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userData.user.id,
        amount: amount,
        wallet_address: walletAddress,
        payment_method: 'coinpayments',
        status: 'pending',
        currency: currency,
        transaction_id: transactionId,
        external_transaction_id: payment.txn_id,
        token_amount: tokenAmount || (tokenPrice ? amount / tokenPrice : amount),
        token_price: tokenPrice,
        payment_address: payment.address
      })
      .select()
      .single();
    
    if (transactionError) {
      console.error("Error storing transaction:", transactionError);
      return {
        ...payment,
        message: "Warning: Failed to store transaction in database"
      };
    }
    
    console.log("Transaction stored in database:", transactionData.id);
    
    // Return success response with transaction data
    return {
      ...payment,
      transactionId: transactionData.id,
      databaseTransactionId: transactionData.id, // Just for clarity
      externalTransactionId: payment.txn_id
    };
  } catch (error) {
    console.error("Error handling crypto payment request:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error handling payment request"
    };
  }
}
