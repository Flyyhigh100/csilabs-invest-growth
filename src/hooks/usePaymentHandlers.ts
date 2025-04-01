
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

type CryptoPaymentDetails = {
  paymentAddress: string;
  transactionId: string;
  instructions: string;
  qrCodeUrl?: string;
  statusUrl?: string;
  expiresAt?: string;
  externalTransactionId?: string;
  currency?: string;
  checkStatusUrl?: string;
  requiresApproval?: boolean;
} | null;

export const usePaymentHandlers = (walletAddress: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCryptoDialog, setShowCryptoDialog] = useState(false);
  const [cryptoPaymentDetails, setCryptoPaymentDetails] = useState<CryptoPaymentDetails>(null);

  // Check KYC verification status
  const { data: kycData } = useQuery({
    queryKey: ['kyc-verification-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching KYC verification:', error);
        return null;
      }
      
      return data;
    }
  });

  const validatePaymentRequest = (amount: number): boolean => {
    if (!walletAddress) {
      toast.error("Please add a wallet address before proceeding with payment");
      return false;
    }
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return false;
    }
    
    // Check if KYC verification is approved
    if (!kycData || kycData.status !== 'approved') {
      toast.error("You must complete KYC verification before making a payment");
      return false;
    }
    
    return true;
  };

  const handleStripePayment = async (amount: number) => {
    if (!validatePaymentRequest(amount)) return;
    
    setIsProcessing(true);
    
    try {
      // Create a transaction record before initiating Stripe checkout
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          amount,
          wallet_address: walletAddress,
          payment_method: 'stripe',
          status: 'pending',
          transaction_id: `STRIPE-${Date.now()}`,
          kyc_verification_id: kycData?.id,
          approval_status: 'approved' // Stripe payments don't need approval
        })
        .select()
        .single();
      
      if (transactionError) {
        console.error("Transaction record creation error:", transactionError);
        throw new Error(transactionError.message || "Failed to create transaction record");
      }
      
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { 
          amount, 
          walletAddress,
          transactionId: transactionData.id
        }
      });
      
      if (error) {
        console.error("Stripe checkout error:", error);
        throw new Error(error.message || "Failed to create payment session");
      }
      
      if (data?.url) {
        toast.info("Redirecting to Stripe checkout...");
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Error creating Stripe checkout:", error);
      toast.error(error.message || "Failed to create payment session. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCoinPaymentsPayment = async (amount: number, currency: string = 'USDT') => {
    if (!validatePaymentRequest(amount)) return;
    
    setIsProcessing(true);
    
    try {
      console.log(`Creating CoinPayments payment with currency: ${currency}`);
      
      // Check if transaction amount requires approval
      const requiresApproval = amount > 3000;
      
      // Create transaction record before initiating CoinPayments checkout
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          amount,
          wallet_address: walletAddress,
          payment_method: 'coinpayments',
          status: 'pending',
          transaction_id: `CP-${Date.now()}`,
          kyc_verification_id: kycData?.id,
          approval_status: requiresApproval ? 'pending' : 'approved'
        })
        .select()
        .single();
      
      if (transactionError) {
        console.error("Transaction record creation error:", transactionError);
        throw new Error(transactionError.message || "Failed to create transaction record");
      }
      
      // If transaction requires approval, show message and don't proceed with payment
      if (requiresApproval) {
        setCryptoPaymentDetails({
          paymentAddress: '',
          transactionId: transactionData.id,
          instructions: 'Your transaction exceeds $3,000 and requires admin approval before processing. You will be notified once approved.',
          requiresApproval: true
        });
        
        setShowCryptoDialog(true);
        toast.success("High-value transaction submitted for approval");
        setIsProcessing(false);
        return;
      }
      
      // If no approval required, proceed with CoinPayments
      const { data, error } = await supabase.functions.invoke('create-coinpayments-payment', {
        body: { 
          amount, 
          walletAddress, 
          currency,
          transactionId: transactionData.id
        }
      });
      
      if (error) {
        console.error("CoinPayments error:", error);
        throw new Error(error.message || "Failed to create CoinPayments transaction");
      }
      
      if (!data) {
        throw new Error("No payment data received");
      }
      
      setCryptoPaymentDetails({
        paymentAddress: data.paymentAddress,
        transactionId: data.transactionId,
        instructions: data.instructions,
        qrCodeUrl: data.qrCodeUrl,
        statusUrl: data.statusUrl,
        expiresAt: data.expiresAt,
        externalTransactionId: data.externalTransactionId,
        currency: data.currency || currency,
        checkStatusUrl: data.checkStatusUrl,
        requiresApproval: false
      });
      
      setShowCryptoDialog(true);
      toast.success("CoinPayments transaction created");
    } catch (error: any) {
      console.error("Error creating CoinPayments transaction:", error);
      toast.error(error.message || "Failed to create CoinPayments transaction. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCryptoPayment = async (amount: number) => {
    if (!validatePaymentRequest(amount)) return;
    
    setIsProcessing(true);
    
    try {
      // Check if transaction amount requires approval
      const requiresApproval = amount > 3000;
      
      // Create transaction record before initiating crypto payment
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          amount,
          wallet_address: walletAddress,
          payment_method: 'crypto',
          status: 'pending',
          transaction_id: `CRYPTO-${Date.now()}`,
          kyc_verification_id: kycData?.id,
          approval_status: requiresApproval ? 'pending' : 'approved'
        })
        .select()
        .single();
      
      if (transactionError) {
        console.error("Transaction record creation error:", transactionError);
        throw new Error(transactionError.message || "Failed to create transaction record");
      }
      
      // If transaction requires approval, show message and don't proceed with payment
      if (requiresApproval) {
        setCryptoPaymentDetails({
          paymentAddress: '',
          transactionId: transactionData.id,
          instructions: 'Your transaction exceeds $3,000 and requires admin approval before processing. You will be notified once approved.',
          requiresApproval: true
        });
        
        setShowCryptoDialog(true);
        toast.success("High-value transaction submitted for approval");
        setIsProcessing(false);
        return;
      }
      
      // If no approval required, proceed with crypto payment
      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: { 
          amount, 
          walletAddress,
          transactionId: transactionData.id
        }
      });
      
      if (error) {
        console.error("Crypto payment error:", error);
        throw new Error(error.message || "Failed to create crypto payment");
      }
      
      if (!data) {
        throw new Error("No payment data received");
      }
      
      setCryptoPaymentDetails({
        paymentAddress: data.paymentAddress,
        transactionId: data.transactionId,
        instructions: data.instructions,
        currency: 'USDC',
        checkStatusUrl: data.checkStatusUrl,
        requiresApproval: false
      });
      
      setShowCryptoDialog(true);
      toast.success("Crypto payment request created");
    } catch (error: any) {
      console.error("Error creating crypto payment:", error);
      toast.error(error.message || "Failed to create crypto payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    showCryptoDialog,
    setShowCryptoDialog,
    cryptoPaymentDetails,
    handleStripePayment,
    handleCoinPaymentsPayment,
    handleCryptoPayment
  };
};
