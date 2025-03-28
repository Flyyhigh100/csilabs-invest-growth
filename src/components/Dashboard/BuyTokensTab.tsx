
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, CreditCard, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import PaymentOption from './PaymentOption';

interface BuyTokensTabProps {
  walletAddress: string | null;
}

const BuyTokensTab: React.FC<BuyTokensTabProps> = ({ walletAddress }) => {
  const handleStripePayment = () => {
    if (!walletAddress) {
      toast.error("Please add a wallet address before proceeding with payment");
      return;
    }
    
    // Implement Stripe checkout here
    toast.info("Redirecting to Stripe checkout...");
    // In a real implementation, you would redirect to your Stripe checkout page or modal
    setTimeout(() => {
      toast.success("This is a demo. In production, users would be redirected to Stripe.");
    }, 1500);
  };
  
  const handleCryptoPayment = () => {
    if (!walletAddress) {
      toast.error("Please add a wallet address before proceeding with payment");
      return;
    }
    
    // Implement CoinPayments checkout here
    toast.info("Preparing crypto payment options...");
    // In a real implementation, you would redirect to your crypto payment provider or show payment addresses
    setTimeout(() => {
      toast.success("This is a demo. In production, users would see crypto payment options for Polygon network.");
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase CSi Tokens</CardTitle>
        <CardDescription>Select your preferred payment method</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!walletAddress ? (
          <Alert className="mb-4">
            <Info className="h-5 w-5" />
            <AlertTitle>Wallet Address Required</AlertTitle>
            <AlertDescription>
              Please add your Polygon wallet address above before proceeding with payment.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <PaymentOption 
              title="Credit/Debit Card" 
              description="Pay securely with Stripe using any major credit or debit card"
              icon={<CreditCard className="h-6 w-6 text-cbis-blue" />}
              onClick={handleStripePayment}
              recommended={true}
            />
            
            <PaymentOption 
              title="Cryptocurrency" 
              description="Pay with cryptocurrency and receive tokens on Polygon"
              icon={<Wallet className="h-6 w-6 text-cbis-blue" />}
              onClick={handleCryptoPayment}
            />
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p className="text-sm text-gray-500">
          By proceeding with payment, you agree to our terms and conditions. All transactions are secure and encrypted.
        </p>
      </CardFooter>
    </Card>
  );
};

export default BuyTokensTab;
