
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, CreditCard, CreditCardIcon, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PaymentOption from './PaymentOption';
import PurchaseAmountInput from './PurchaseAmountInput';
import ProcessingIndicator from './ProcessingIndicator';
import CryptoPaymentDialog from './CryptoPaymentDialog';
import { usePaymentHandlers } from '@/hooks/usePaymentHandlers';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BuyTokensTabProps {
  walletAddress: string | null;
}

const BuyTokensTab: React.FC<BuyTokensTabProps> = ({
  walletAddress
}) => {
  const [amount, setAmount] = useState<number>(100);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
  const {
    isProcessing,
    showCryptoDialog,
    setShowCryptoDialog,
    cryptoPaymentDetails,
    handleStripePayment,
    handleCoinPaymentsPayment
  } = usePaymentHandlers(walletAddress);

  // Fetch KYC verification status
  const { data: kycData, isLoading: isLoadingKyc } = useQuery({
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

  const renderWalletAlert = () => {
    if (!walletAddress) {
      return <Alert className="mb-4">
          <Info className="h-5 w-5" />
          <AlertTitle>Wallet Address Required</AlertTitle>
          <AlertDescription>
            Please add your Polygon wallet address above before proceeding with payment.
          </AlertDescription>
        </Alert>;
    }
    return null;
  };
  
  const renderKycAlert = () => {
    if (!kycData || kycData.status !== 'approved') {
      return (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle>KYC Verification Required</AlertTitle>
          <AlertDescription>
            You must complete KYC verification before making a payment. This ensures compliance with financial regulations.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  const handleCoinPaymentWithCurrency = () => {
    handleCoinPaymentsPayment(amount, selectedCurrency);
  };
  
  // Determine if the current transaction would require approval
  const requiresApproval = amount > 3000 && selectedCurrency !== 'USD';
  
  // Render appropriate message for crypto payments
  const renderCryptoPaymentMessage = () => {
    if (requiresApproval) {
      return (
        <Alert className="mt-4 mb-2 bg-amber-50 text-amber-800 border-amber-200">
          <Info className="h-5 w-5" />
          <AlertTitle>High-Value Transaction</AlertTitle>
          <AlertDescription>
            Crypto payments over $3,000 require admin approval and will be processed within 24 hours.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Purchase CSi Tokens
            <Badge variant="success" className="ml-2">Test Mode</Badge>
          </CardTitle>
          <CardDescription>Select your preferred payment method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 rounded-sm">
          {renderWalletAlert()}
          {renderKycAlert()}
          
          {walletAddress && <>
              <PurchaseAmountInput amount={amount} onChange={setAmount} disabled={isProcessing} />
              
              {/* Credit Card Option - Now placed above crypto options with enhanced styling */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Recommended Payment Method</h3>
                <PaymentOption 
                  title="Credit/Debit Card" 
                  description="Pay securely with Stripe using any major credit or debit card" 
                  icon={<CreditCard className="h-6 w-6 text-cbis-blue" />} 
                  onClick={() => handleStripePayment(amount)} 
                  recommended={true} 
                  disabled={isProcessing || (kycData && kycData.status !== 'approved')}
                  highlight={true} // New prop for highlighting
                />
                
                {/* Message for card payments if KYC is approved */}
                {kycData && kycData.status === 'approved' && (
                  <Alert className="mt-2 bg-blue-50 text-blue-800 border-blue-200">
                    <Info className="h-5 w-5" />
                    <AlertTitle>Ready for Payment</AlertTitle>
                    <AlertDescription>
                      Your KYC verification is approved. You can proceed with card payment immediately.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-2">Pay with Crypto</h3>
                
                <div className="space-y-2 mb-4">
                  <Label htmlFor="crypto-currency" className="text-cbis-teal font-semibold">Select Cryptocurrency</Label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency} disabled={isProcessing}>
                    <SelectTrigger id="crypto-currency" className="w-full border-2 border-cbis-teal/50 bg-blue-50/30 focus:ring-2 focus:ring-cbis-blue focus:border-cbis-blue transition-all">
                      <SelectValue placeholder="Select cryptocurrency" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-cbis-teal/50 shadow-lg z-50">
                      <SelectItem value="USDT" className="hover:bg-blue-50">USDT (Tether)</SelectItem>
                      <SelectItem value="BTC" className="hover:bg-blue-50">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH" className="hover:bg-blue-50">Ethereum (ETH)</SelectItem>
                      <SelectItem value="DOGE" className="hover:bg-blue-50">Dogecoin (DOGE)</SelectItem>
                      <SelectItem value="XRP" className="hover:bg-blue-50">Ripple (XRP)</SelectItem>
                      <SelectItem value="LTCT" className="hover:bg-blue-50">Litecoin Testnet (LTCT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              
                <PaymentOption 
                  title={`Pay with ${selectedCurrency}`} 
                  description="Use CoinPayments to pay with your favorite cryptocurrency" 
                  icon={<CreditCardIcon className="h-6 w-6 text-cbis-blue" />} 
                  onClick={handleCoinPaymentWithCurrency} 
                  disabled={isProcessing || (kycData && kycData.status !== 'approved')}
                  highlight={false}
                  cryptoHighlight={true} // New prop for crypto highlighting
                />
                
                {/* Render message for crypto payments */}
                {renderCryptoPaymentMessage()}
              </div>
              
              {isProcessing && <ProcessingIndicator />}
            </>}
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
      
      <CryptoPaymentDialog open={showCryptoDialog} onOpenChange={setShowCryptoDialog} paymentDetails={cryptoPaymentDetails} amount={amount} selectedCurrency={selectedCurrency} />
    </>;
};

export default BuyTokensTab;
