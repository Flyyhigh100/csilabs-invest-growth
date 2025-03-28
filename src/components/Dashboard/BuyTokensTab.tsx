
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, CreditCard, Wallet } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import PaymentOption from './PaymentOption';
import PurchaseAmountInput from './PurchaseAmountInput';
import ProcessingIndicator from './ProcessingIndicator';
import CryptoPaymentDialog from './CryptoPaymentDialog';
import { usePaymentHandlers } from '@/hooks/usePaymentHandlers';

interface BuyTokensTabProps {
  walletAddress: string | null;
}

const BuyTokensTab: React.FC<BuyTokensTabProps> = ({ walletAddress }) => {
  const [amount, setAmount] = useState<number>(100);
  const {
    isProcessing,
    showCryptoDialog,
    setShowCryptoDialog,
    cryptoPaymentDetails,
    handleStripePayment,
    handleCryptoPayment
  } = usePaymentHandlers(walletAddress);

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
                onClick={() => handleStripePayment(amount)}
                recommended={true}
                disabled={isProcessing}
              />
              
              <PaymentOption 
                title="Cryptocurrency" 
                description="Pay with cryptocurrency and receive tokens on Polygon"
                icon={<Wallet className="h-6 w-6 text-cbis-blue" />}
                onClick={() => handleCryptoPayment(amount)}
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
