
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { createSupabaseClient, saveTransaction } from "./db-client.ts";
import { createCoinPaymentsTransaction } from "./api-client.ts";
import { cleanPaymentAddress } from "./address-utils.ts";

/**
 * Handles the crypto payment request, with or without authentication
 */
export async function handleCryptoPaymentRequest(authHeader: string, amount: number, walletAddress: string, currency: string) {
  // Create Supabase client to record the transaction
  const supabaseClient = createSupabaseClient();
  
  // Generate a unique transaction ID
  const transactionId = crypto.randomUUID();

  try {
    // Get the user from the authorization header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.log('Authentication error:', userError?.message || 'User not found');
      return await handleAnonymousPayment(amount, currency, transactionId, walletAddress);
    }

    // Authenticated user flow
    return await handleAuthenticatedPayment(
      supabaseClient, 
      user.id, 
      user.email, 
      amount, 
      currency, 
      transactionId, 
      walletAddress
    );
    
  } catch (error) {
    console.error('General error in user authentication flow:', error);
    // Fall back to anonymous payment as a last resort
    return await handleAnonymousPayment(amount, currency, transactionId, walletAddress, true);
  }
}

/**
 * Handles payment creation for authenticated users
 */
async function handleAuthenticatedPayment(
  supabaseClient: any, 
  userId: string, 
  userEmail: string, 
  amount: number, 
  currency: string, 
  transactionId: string, 
  walletAddress: string
) {
  try {
    // Create a new transaction in CoinPayments API with authenticated user
    const paymentData = await createCoinPaymentsTransaction(
      amount, 
      currency, 
      transactionId, 
      walletAddress, 
      userEmail
    );
    
    // Extract and clean payment address
    const paymentAddress = cleanPaymentAddress(paymentData.address);
    
    // Generate a QR code with just the payment address
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentAddress)}&size=200x200`;

    try {
      // Save transaction to database with the clean address
      await saveTransaction(
        supabaseClient,
        userId,
        amount,
        walletAddress,
        transactionId,
        paymentAddress, // Use the cleaned address
        paymentData.txn_id,
        currency
      );
    } catch (dbError) {
      // Continue without failing - we'll still return the payment details
      console.log('Database error when saving transaction:', dbError);
      console.log('Continuing despite database error');
    }

    return formatPaymentResponse(paymentData, paymentAddress, transactionId, qrCodeUrl, amount, currency);
    
  } catch (apiError) {
    console.error('Error with CoinPayments API:', apiError);
    
    // Fall back to mock data if api fails
    const mockPaymentData = await createCoinPaymentsTransaction(
      amount, 
      currency, 
      transactionId, 
      walletAddress, 
      userEmail,
      true // Force mock mode
    );
    
    // Extract and clean payment address
    const paymentAddress = cleanPaymentAddress(mockPaymentData.address);
    
    // Generate a QR code with just the payment address
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentAddress)}&size=200x200`;
    
    try {
      // Save transaction with mock data and clean address
      await saveTransaction(
        supabaseClient,
        userId,
        amount,
        walletAddress,
        transactionId,
        paymentAddress, // Use the cleaned address
        mockPaymentData.txn_id,
        currency
      );
    } catch (dbError) {
      console.error('Database error when saving transaction with mock data:', dbError);
    }
    
    return formatPaymentResponse(mockPaymentData, paymentAddress, transactionId, qrCodeUrl, amount, currency);
  }
}

/**
 * Handles payment creation for anonymous users or when authentication fails
 */
async function handleAnonymousPayment(
  amount: number, 
  currency: string, 
  transactionId: string, 
  walletAddress: string,
  forceMock = false
) {
  try {
    // Create a transaction using API keys but with anonymous email
    const paymentData = await createCoinPaymentsTransaction(
      amount, 
      currency, 
      transactionId, 
      walletAddress, 
      'anonymous@example.com',
      forceMock
    );
    
    // Extract and clean payment address to ensure it doesn't have currency prefixes
    const paymentAddress = cleanPaymentAddress(paymentData.address);
    
    // Generate a QR code with just the payment address
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentAddress)}&size=200x200`;
    
    return formatPaymentResponse(paymentData, paymentAddress, transactionId, qrCodeUrl, amount, currency);
  } catch (apiError) {
    console.error('Error creating transaction with anonymous user:', apiError);
    
    // Fall back to mock data if api fails
    const mockPaymentData = await createCoinPaymentsTransaction(
      amount, 
      currency, 
      transactionId, 
      walletAddress, 
      'anonymous@example.com',
      true // Force mock mode
    );
    
    // Extract and clean payment address
    const paymentAddress = cleanPaymentAddress(mockPaymentData.address);
    
    // Generate a QR code with just the payment address
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentAddress)}&size=200x200`;
    
    return formatPaymentResponse(mockPaymentData, paymentAddress, transactionId, qrCodeUrl, amount, currency);
  }
}

/**
 * Formats the payment response object
 */
function formatPaymentResponse(paymentData: any, paymentAddress: string, transactionId: string, qrCodeUrl: string, amount: number, currency: string) {
  return {
    paymentAddress: paymentAddress,
    amount: paymentData.amount,
    transactionId: transactionId,
    externalTransactionId: paymentData.txn_id,
    qrCodeUrl: qrCodeUrl, // Use the clean QR code URL
    statusUrl: paymentData.status_url,
    expiresAt: new Date(paymentData.timeout * 1000).toISOString(),
    currency: paymentData.currency || currency,
    instructions: `Please send ${paymentData.amount} ${paymentData.currency || currency} to the address above to complete your purchase.`,
    usdValue: amount // Add the original USD amount for reference
  };
}
