
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
 * Create a new crypto payment transaction with improved validation and error handling
 */
export async function createCryptoPayment(
  amount: number, 
  walletAddress: string, 
  currency: string = 'USDT',
  tokenPrice?: number
): Promise<CryptoPaymentResponse> {
  try {
    console.log(`Creating crypto payment: $${amount} in ${currency} for wallet ${walletAddress}`);
    
    // Thorough input validation
    if (!amount || isNaN(amount) || amount <= 0) {
      return { success: false, message: "Invalid amount: must be a positive number" };
    }

    // Update minimum amount validation
    if (amount < 2) {
      return { 
        success: false, 
        message: `Minimum payment amount is $2 USD to cover network fees for ${currency}` 
      };
    }
    
    if (!walletAddress || walletAddress.trim() === '') {
      return { success: false, message: "Missing or empty wallet address" };
    }

    if (!currency || currency.trim() === '') {
      return { success: false, message: "Missing or empty currency code" };
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
    const tokenAmount = tokenPrice && tokenPrice > 0 ? amount / tokenPrice : amount;
    
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
      
      // Improved error message formatting for user-friendly display
      let errorMessage = "Failed to create payment";
      let errorDetails = {};
      
      if (apiError instanceof Error) {
        errorMessage = apiError.message;
        errorDetails = { 
          errorType: 'API Error',
          message: apiError.message,
          stack: apiError.stack
        };
        
        if (apiError.message.includes("Amount too small") || apiError.message.includes("network fees")) {
          errorMessage = `Minimum payment amount required for ${currency} to cover network fees`;
        } else if (apiError.message.includes("nonce")) {
          errorMessage = "API authentication error: Invalid nonce";
          errorDetails = { 
            ...errorDetails,
            suggestion: "This may be due to a timestamp synchronization issue with the API server"
          };
        } else if (apiError.message.includes("HMAC")) {
          errorMessage = "API authentication error: Invalid HMAC signature";
          errorDetails = { 
            ...errorDetails,
            suggestion: "This may be due to incorrect API keys or a payload formatting issue"
          };
        }
      }
      
      return { 
        success: false, 
        message: errorMessage,
        debug: { 
          error: errorDetails,
          params: {
            amount,
            currency,
            walletAddress: walletAddress.substring(0, 10) + '...' // Partial for security
          }
        } 
      };
    }
  } catch (error) {
    console.error("Error creating crypto payment:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error creating payment",
      debug: { 
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      }
    };
  }
}
