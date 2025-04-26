
import { createSupabaseClient, saveTransaction } from './db-client.ts';
import { createCryptoPayment } from './crypto-service.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Handles the crypto payment request and creates transaction records
 */
export async function handleCryptoPaymentRequest(
  authHeader: string, 
  amount: number, 
  walletAddress: string,
  currency: string = 'USDT',
  tokenPrice?: number,
  tokenAmount?: number
): Promise<any> {
  try {
    console.log(`Starting payment request handler for amount: ${amount} ${currency}`);
    
    // Extract token from auth header
    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client to interact with database
    const supabaseClient = createSupabaseClient();
    
    // Get user information from the token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      throw new Error(userError?.message || 'Authentication failed');
    }
    
    console.log(`Creating payment for user ${user.id}, wallet: ${walletAddress}, amount: ${amount} ${currency}`);
    
    // Create crypto payment using CoinPayments
    let paymentResponse;
    try {
      paymentResponse = await createCryptoPayment(amount, walletAddress, currency, tokenPrice);
    } catch (paymentError) {
      console.error('Failed to create CoinPayments transaction:', paymentError);
      return {
        success: false,
        message: paymentError.message || 'Failed to create payment',
        error: paymentError instanceof Error ? paymentError.message : 'Unknown error'
      };
    }
    
    if (!paymentResponse.success) {
      console.error('Payment creation failed:', paymentResponse);
      return {
        success: false,
        message: paymentResponse.message || 'Failed to create payment'
      };
    }
    
    // Generate a transaction ID for our system
    const transactionId = crypto.randomUUID();
    
    console.log(`Payment created successfully. Transaction ID: ${transactionId}, External ID: ${paymentResponse.txn_id}`);
    
    // Save transaction in database
    const savedTransaction = await saveTransaction(
      supabaseClient,
      user.id,
      amount,
      walletAddress,
      transactionId,
      paymentResponse.address,
      paymentResponse.txn_id,
      currency,
      tokenPrice,
      tokenAmount || paymentResponse.tokenAmount
    );
    
    // Return success with payment information
    return {
      success: true,
      transactionId: savedTransaction.id,
      paymentAddress: paymentResponse.address,
      amount: paymentResponse.amount,
      amountf: paymentResponse.amount,
      timeout: paymentResponse.timeout, // Send as a number of seconds
      statusUrl: paymentResponse.status_url,
      qrCodeUrl: paymentResponse.qrcode_url,
      externalTransactionId: paymentResponse.txn_id,
      currency: currency,
      checkStatusUrl: `/dashboard/transactions?payment=crypto&txn=${savedTransaction.id}`,
      tokenAmount: tokenAmount || paymentResponse.tokenAmount,
      tokenPrice: tokenPrice
    };
  } catch (error) {
    console.error('Error in handleCryptoPaymentRequest:', error);
    return {
      success: false,
      message: error.message || 'Failed to process crypto payment'
    };
  }
}
