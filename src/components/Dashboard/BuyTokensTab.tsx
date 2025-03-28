
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, CreditCard, Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PaymentOption from './PaymentOption';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
              <div className="mb-6">
                <Label htmlFor="amount">Purchase Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  min={10}
                  step={10}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Minimum purchase: $10 USD
                </p>
              </div>
            
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
              
              {isProcessing && (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-cbis-blue mr-2" />
                  <span>Processing payment request...</span>
                </div>
              )}
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
      
      <Dialog open={showCryptoDialog} onOpenChange={setShowCryptoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cryptocurrency Payment</DialogTitle>
            <DialogDescription>
              Follow these instructions to complete your purchase
            </DialogDescription>
          </DialogHeader>
          
          {cryptoPaymentDetails && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Payment Address (USDC on Polygon)</Label>
                <div className="p-2 bg-gray-100 rounded-md font-mono text-sm break-all">
                  {cryptoPaymentDetails.paymentAddress}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="p-2 bg-gray-100 rounded-md">
                  {amount} USDC
                </div>
              </div>
              
              <Alert>
                <Info className="h-5 w-5" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  {cryptoPaymentDetails.instructions}
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-muted-foreground">
                Transaction ID: {cryptoPaymentDetails.transactionId}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowCryptoDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BuyTokensTab;
