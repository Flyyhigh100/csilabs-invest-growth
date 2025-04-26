
import { createSupabaseClient, saveTransaction } from './db-client.ts';
import { createCryptoPayment } from './crypto-service.ts';

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
    const paymentResponse = await createCryptoPayment(amount, walletAddress, currency);
    
    if (!paymentResponse.success) {
      console.error('Failed to create CoinPayments transaction:', paymentResponse.message);
      throw new Error(paymentResponse.message || 'Failed to create CoinPayments transaction');
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
      tokenAmount
    );
    
    // Return success with payment information
    return {
      success: true,
      transactionId: savedTransaction.id,
      paymentAddress: paymentResponse.address,
      amount: paymentResponse.amount,
      amountf: paymentResponse.amount,
      expiresAt: paymentResponse.timeout,
      statusUrl: paymentResponse.status_url,
      qrCodeUrl: paymentResponse.qrcode_url,
      externalTransactionId: paymentResponse.txn_id,
      currency: currency,
      checkStatusUrl: `/dashboard/transactions?payment=crypto&txn=${savedTransaction.id}`,
      tokenAmount: tokenAmount,
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
