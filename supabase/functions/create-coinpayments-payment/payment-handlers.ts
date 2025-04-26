
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { createSupabaseClient, saveTransaction } from "./db-client.ts";
import { createCoinPaymentsTransaction } from "./api-client.ts";
import { cleanPaymentAddress } from "./address-utils.ts";

/**
 * Handles the crypto payment request, with or without authentication
 */
export async function handleCryptoPaymentRequest(
  authHeader: string, 
  amount: number, 
  walletAddress: string, 
  currency: string,
  tokenPrice?: number,
  tokenAmount?: number
) {
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
      return await handleAnonymousPayment(amount, currency, transactionId, walletAddress, false, tokenPrice, tokenAmount);
    }

    // Authenticated user flow
    return await handleAuthenticatedPayment(
      supabaseClient, 
      user.id, 
      user.email, 
      amount, 
      currency, 
      transactionId, 
      walletAddress,
      tokenPrice,
      tokenAmount
    );
    
  } catch (error) {
    console.error('General error in user authentication flow:', error);
    // Fall back to anonymous payment as a last resort
    return await handleAnonymousPayment(amount, currency, transactionId, walletAddress, true, tokenPrice, tokenAmount);
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
  walletAddress: string,
  tokenPrice?: number,
  tokenAmount?: number
) {
  try {
    // Calculate token amount if not provided but token price is
    const calculatedTokenAmount = tokenAmount || (tokenPrice ? amount / tokenPrice : amount);
    
    // Create a new transaction in CoinPayments API with authenticated user
    const paymentData = await createCoinPaymentsTransaction(
      amount, 
      currency, 
      transactionId, 
      walletAddress, 
      userEmail
    );
    
    // Extract and clean payment address - IMPORTANT: This should be the address from CoinPayments, not the wallet address
    const paymentAddress = cleanPaymentAddress(paymentData.address);
    console.log(`Payment address from CoinPayments: ${paymentAddress} (original: ${paymentData.address})`);
    
    try {
      // Save transaction to database with the CoinPayments payment address
      await saveTransaction(
        supabaseClient,
        userId,
        amount,
        walletAddress,
        transactionId,
        paymentAddress, // Using the CoinPayments address for payment
        paymentData.txn_id,
        currency,
        tokenPrice,
        calculatedTokenAmount
      );
    } catch (dbError) {
      // Continue without failing - we'll still return the payment details
      console.log('Database error when saving transaction:', dbError);
      console.log('Continuing despite database error');
    }

    return formatPaymentResponse(
      paymentData, 
      paymentAddress, 
      transactionId, 
      amount, 
      currency, 
      tokenPrice, 
      calculatedTokenAmount
    );
    
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
    
    // Calculate token amount if not provided but token price is
    const calculatedTokenAmount = tokenAmount || (tokenPrice ? amount / tokenPrice : amount);
    
    // Extract and clean payment address - Use mock payment address
    const paymentAddress = cleanPaymentAddress(mockPaymentData.address);
    console.log(`Mock payment address: ${paymentAddress}`);
    
    try {
      // Save transaction with mock data 
      await saveTransaction(
        supabaseClient,
        userId,
        amount,
        walletAddress,
        transactionId,
        paymentAddress, // Use the mock payment address
        mockPaymentData.txn_id,
        currency,
        tokenPrice,
        calculatedTokenAmount
      );
    } catch (dbError) {
      console.error('Database error when saving transaction with mock data:', dbError);
    }
    
    return formatPaymentResponse(
      mockPaymentData, 
      paymentAddress, 
      transactionId, 
      amount, 
      currency, 
      tokenPrice, 
      calculatedTokenAmount
    );
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
  forceMock = false,
  tokenPrice?: number,
  tokenAmount?: number
) {
  try {
    // Calculate token amount if not provided but token price is
    const calculatedTokenAmount = tokenAmount || (tokenPrice ? amount / tokenPrice : amount);
    
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
    console.log(`Anonymous payment address: ${paymentAddress}`);
    
    return formatPaymentResponse(
      paymentData, 
      paymentAddress, 
      transactionId, 
      amount, 
      currency,
      tokenPrice,
      calculatedTokenAmount
    );
  } catch (apiError) {
    console.error('Error creating transaction with anonymous user:', apiError);
    
    // Calculate token amount if not provided but token price is
    const calculatedTokenAmount = tokenAmount || (tokenPrice ? amount / tokenPrice : amount);
    
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
    console.log(`Mock anonymous payment address: ${paymentAddress}`);
    
    return formatPaymentResponse(
      mockPaymentData, 
      paymentAddress, 
      transactionId, 
      amount, 
      currency,
      tokenPrice,
      calculatedTokenAmount
    );
  }
}

/**
 * Formats the payment response object
 */
function formatPaymentResponse(
  paymentData: any, 
  paymentAddress: string, 
  transactionId: string, 
  amount: number, 
  currency: string,
  tokenPrice?: number,
  tokenAmount?: number
) {
  const timeoutSeconds = paymentData.timeout || 1800;
  const expiresAt = new Date(Date.now() + (timeoutSeconds * 1000)).toISOString();
  
  // Always use CoinPayments QR code URL if available
  const qrCodeUrl = paymentData.qrcode_url || null;
  
  // Log QR code details for debugging
  console.log(`QR code URL from payment data: ${paymentData.qrcode_url || 'Not provided'}`);
  
  return {
    paymentAddress: paymentAddress,
    amount: paymentData.amount,
    transactionId: transactionId,
    externalTransactionId: paymentData.txn_id,
    qrCodeUrl: qrCodeUrl,
    statusUrl: paymentData.status_url,
    expiresAt: expiresAt,
    currency: paymentData.currency || currency,
    instructions: `Please send ${paymentData.amount} ${paymentData.currency || currency} to the address above to complete your purchase.`,
    usdValue: amount,
    tokenPrice: tokenPrice || 1.00,
    tokenAmount: tokenAmount || amount
  };
}
