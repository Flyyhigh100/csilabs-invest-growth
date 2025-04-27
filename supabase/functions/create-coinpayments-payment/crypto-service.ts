import { createCoinPaymentsTransaction, CoinPaymentsTransaction } from './api-client.ts';

interface CryptoPaymentResponse {
  success: boolean;
  address?: string;
  amount?: string | number;
  timeout?: number;
  status_url?: string;
  qrcode_url?: string;
  txn_id?: string;
  message?: string;
  tokenAmount?: number;
  expiresAt?: string;
  transactionId?: string;
  debug?: any;
}

/**
 * Create a new crypto payment transaction
 */
export async function createCryptoPayment(
  amount: number, 
  walletAddress: string, 
  currency: string = 'USDT',
  tokenPrice?: number
): Promise<CryptoPaymentResponse> {
  try {
    console.log(`Creating crypto payment: $${amount} in ${currency} for wallet ${walletAddress}`);
    
    if (!amount || amount <= 0) {
      return { success: false, message: "Invalid amount" };
    }
    
    if (!walletAddress) {
      return { success: false, message: "Missing wallet address" };
    }

    // Check if we have API keys configured
    const publicKey = Deno.env.get("COINPAYMENTS_PUBLIC_KEY");
    const privateKey = Deno.env.get("COINPAYMENTS_PRIVATE_KEY");
    
    if (!publicKey || !privateKey) {
      console.error("CoinPayments API keys not configured");
      return { 
        success: false, 
        message: "CoinPayments API keys not configured", 
        debug: { 
          publicKeyExists: !!publicKey,
          privateKeyExists: !!privateKey 
        } 
      };
    }
    
    // Generate a unique ID for this transaction based on timestamp and random values
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Calculate token amount if token price is provided
    const tokenAmount = tokenPrice ? amount / tokenPrice : amount;
    
    console.log(`Creating CoinPayments transaction for $${amount} in ${currency}`);
    try {
      const payment = await createCoinPaymentsTransaction(
        amount, 
        currency, 
        uniqueId, 
        walletAddress
      );
      
      // Calculate expiration time
      const expiresAt = new Date(Date.now() + (payment.timeout * 1000)).toISOString();
      
      console.log(`Payment created successfully: ${payment.txn_id}`);
      
      return {
        success: true,
        address: payment.address,
        amount: payment.amount,
        timeout: payment.timeout,
        status_url: payment.status_url,
        qrcode_url: payment.qrcode_url,
        txn_id: payment.txn_id,
        transactionId: payment.txn_id, // Extra field for consistency
        tokenAmount,
        expiresAt
      };
    } catch (apiError) {
      console.error("CoinPayments API call failed:", apiError);
      // If mock data is allowed, we'll get mock data from the api-client
      // Otherwise it will have thrown an error already
      return { 
        success: false, 
        message: apiError instanceof Error ? apiError.message : "Unknown error creating payment",
        debug: { error: apiError } 
      };
    }
  } catch (error) {
    console.error("Error creating crypto payment:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error creating payment",
      debug: { error }
    };
  }
}
