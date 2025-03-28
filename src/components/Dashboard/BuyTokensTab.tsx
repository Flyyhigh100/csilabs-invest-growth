
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, CreditCard, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PaymentOption from './PaymentOption';
import { Badge } from "@/components/ui/badge";
import PurchaseAmountInput from './PurchaseAmountInput';
import ProcessingIndicator from './ProcessingIndicator';
import CryptoPaymentDialog from './CryptoPaymentDialog';

interface BuyTokensTabProps {
  walletAddress: string | null;
}

const BuyTokensTab: React.FC<BuyTokensTabProps> = ({ walletAddress }) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCryptoDialog, setShowCryptoDialog] = useState(false);
  const [amount, setAmount] = useState<number>(100);
  const [cryptoPaymentDetails, setCryptoPaymentDetails] = useState<{
    paymentAddress: string;
    transactionId: string;
    instructions: string;
  } | null>(null);

  const handleStripePayment = async () => {
    if (!walletAddress) {
      toast.error("Please add a wallet address before proceeding with payment");
      return;
    }
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { amount, walletAddress }
      });
      
      if (error) throw error;
      
      if (data.url) {
        toast.info("Redirecting to Stripe checkout...");
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating Stripe checkout:", error);
      toast.error("Failed to create payment session. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCryptoPayment = async () => {
    if (!walletAddress) {
      toast.error("Please add a wallet address before proceeding with payment");
      return;
    }
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: { amount, walletAddress }
      });
      
      if (error) throw error;
      
      setCryptoPaymentDetails({
        paymentAddress: data.paymentAddress,
        transactionId: data.transactionId,
        instructions: data.instructions
      });
      
      setShowCryptoDialog(true);
    } catch (error) {
      console.error("Error creating crypto payment:", error);
      toast.error("Failed to create crypto payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderWalletAlert = () => {
    if (!walletAddress) {
      return (
        <Alert className="mb-4">
          <Info className="h-5 w-5" />
          <AlertTitle>Wallet Address Required</AlertTitle>
          <AlertDescription>
            Please add your Polygon wallet address above before proceeding with payment.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Purchase CSi Tokens
            <Badge variant="success" className="ml-2">Test Mode</Badge>
          </CardTitle>
          <CardDescription>Select your preferred payment method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderWalletAlert()}
          
          {walletAddress && (
            <>
              <PurchaseAmountInput 
                amount={amount} 
                onChange={setAmount} 
                disabled={isProcessing} 
              />
            
              <PaymentOption 
                title="Credit/Debit Card" 
                description="Pay securely with Stripe using any major credit or debit card"
                icon={<CreditCard className="h-6 w-6 text-cbis-blue" />}
                onClick={handleStripePayment}
                recommended={true}
                disabled={isProcessing}
              />
              
              <PaymentOption 
                title="Cryptocurrency" 
                description="Pay with cryptocurrency and receive tokens on Polygon"
                icon={<Wallet className="h-6 w-6 text-cbis-blue" />}
                onClick={handleCryptoPayment}
                disabled={isProcessing}
              />
              
              {isProcessing && <ProcessingIndicator />}
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Alert className="w-full bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-5 w-5" />
            <AlertTitle>Test Mode Active</AlertTitle>
            <AlertDescription>
              For testing, use Stripe test card: 4242 4242 4242 4242, any future date, any 3 digits CVC, and any postal code.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
      
      <CryptoPaymentDialog 
        open={showCryptoDialog} 
        onOpenChange={setShowCryptoDialog}
        paymentDetails={cryptoPaymentDetails}
        amount={amount}
      />
    </>
  );
};

export default BuyTokensTab;
