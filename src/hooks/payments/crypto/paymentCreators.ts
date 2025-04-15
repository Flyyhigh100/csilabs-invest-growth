
import { supabase } from '@/integrations/supabase/client';
import { CryptoPaymentDetails } from '../types';
import { toast } from 'sonner';
import { convertUsdToCrypto } from './currencyConverter';
import { CoinPaymentsCreateParams, CryptoPaymentCreateParams } from './types';

/**
 * Creates a CoinPayments transaction
 */
export async function createCoinPaymentsTransaction(
  params: CoinPaymentsCreateParams
): Promise<CryptoPaymentDetails | null> {
  const { amount, walletAddress, currency, cryptoAmount: providedCryptoAmount } = params;
  
  try {
    toast.info(`Creating ${currency} payment...`, {
      id: "crypto-preparing",
      description: `Preparing ${currency} payment session.`,
    });
    
    // Convert USD amount to crypto amount if not provided
    let cryptoAmount = providedCryptoAmount;
    if (!cryptoAmount) {
      console.log(`Converting $${amount} to ${currency}...`);
      cryptoAmount = await convertUsdToCrypto(amount, currency);
      console.log(`Conversion result: ${cryptoAmount} ${currency}`);
    }
    
    console.log(`Creating CoinPayments payment with currency: ${currency}, amount: ${cryptoAmount} ${currency} (${amount} USD)`);
    
    const { data, error } = await supabase.functions.invoke('create-coinpayments-payment', {
      body: { 
        amount: amount,  // We still send the USD amount 
        walletAddress, 
        currency,
        cryptoAmount: cryptoAmount // Add the converted amount
      }
    });
    
    toast.dismiss("crypto-preparing");
    
    if (error) {
      console.error("CoinPayments error:", error);
      throw new Error(error.message || "Failed to create CoinPayments transaction");
    }
    
    if (!data) {
      throw new Error("No payment data received");
    }
    
    return {
      paymentAddress: data.paymentAddress,
      transactionId: data.transactionId,
      instructions: data.instructions,
      qrCodeUrl: data.qrCodeUrl,
      statusUrl: data.statusUrl,
      expiresAt: data.expiresAt,
      externalTransactionId: data.externalTransactionId,
      currency: data.currency || currency,
      checkStatusUrl: data.checkStatusUrl,
      cryptoAmount: data.cryptoAmount || cryptoAmount,
      amount: amount
    };
    
  } catch (error: any) {
    console.error("Error creating CoinPayments transaction:", error);
    toast.error("Crypto payment failed", {
      description: error.message || "Unable to create payment request. Please try again.",
    });
    return null;
  }
}

/**
 * Creates a direct crypto payment transaction (currently for USDC)
 */
export async function createCryptoTransaction(
  params: CryptoPaymentCreateParams
): Promise<CryptoPaymentDetails | null> {
  const { amount, walletAddress } = params;
  
  try {
    toast.info("Creating crypto payment...", {
      id: "direct-crypto-preparing",
      description: "Preparing USDC payment session. Please wait..."
    });
    
    const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
      body: { amount, walletAddress }
    });
    
    toast.dismiss("direct-crypto-preparing");
    
    if (error) {
      console.error("Crypto payment error:", error);
      throw new Error(error.message || "Failed to create crypto payment");
    }
    
    if (!data) {
      throw new Error("No payment data received");
    }
    
    return {
      paymentAddress: data.paymentAddress,
      transactionId: data.transactionId,
      instructions: data.instructions,
      currency: 'USDC',
      checkStatusUrl: data.checkStatusUrl,
      amount: amount
    };
    
  } catch (error: any) {
    console.error("Error creating crypto payment:", error);
    toast.error("Crypto payment failed", {
      description: error.message || "Unable to create payment request. Please try again.",
    });
    return null;
  }
}
