
import { createCoinPaymentsTransaction, CoinPaymentsTransaction } from './api-client.ts';

/**
 * Create a new crypto payment transaction
 */
export async function createCryptoPayment(
  amount: number, 
  walletAddress: string, 
  currency: string = 'USDT',
  tokenPrice?: number
): Promise<any> {
  try {
    console.log(`Creating CoinPayments payment with params:`, {
      amount,
      walletAddress,
      currency,
      tokenPrice
    });
    
    // Calculate token amount if price is provided
    const tokenAmount = tokenPrice ? amount / tokenPrice : amount;
    console.log(`Calculated token amount: ${tokenAmount}`);
    
    // Check for required API keys
    const publicKey = Deno.env.get("COINPAYMENTS_PUBLIC_KEY");
    const privateKey = Deno.env.get("COINPAYMENTS_PRIVATE_KEY");
    
    if (!publicKey || !privateKey) {
      console.error('Missing CoinPayments API keys');
      throw new Error('CoinPayments API keys not configured');
    }
    
    // Create transaction using the api client
    const result = await createCoinPaymentsTransaction(
      amount,
      currency,
      crypto.randomUUID(),
      walletAddress,
      'buyer@example.com',
      false
    );
    
    if (!result) {
      throw new Error('Failed to create CoinPayments transaction');
    }
    
    console.log('Transaction created successfully:', result);
    
    return {
      success: true,
      address: result.address,
      amount: result.amount,
      txn_id: result.txn_id,
      status_url: result.status_url,
      qrcode_url: result.qrcode_url,
      timeout: result.timeout,
      tokenAmount,
      tokenPrice
    };
  } catch (error) {
    console.error('Error in createCryptoPayment:', error);
    throw error;
  }
}
