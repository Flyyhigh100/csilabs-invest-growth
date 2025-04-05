
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
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface BuyTokensTabProps {
  walletAddress: string | null;
}

const BuyTokensTab: React.FC<BuyTokensTabProps> = ({
  walletAddress
}) => {
  const [amount, setAmount] = useState<number>(100);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
  const { kycData } = useKycVerification();
  
  const {
    isProcessing,
    showCryptoDialog,
    setShowCryptoDialog,
    cryptoPaymentDetails,
    handleStripePayment,
    handleCoinPaymentsPayment,
    kycRequired
  } = usePaymentHandlers(walletAddress);

  // Check if KYC is needed based on amount and is not approved
  const isKycNeeded = kycRequired(amount) && kycData?.status !== 'approved';
  const isKycPending = kycData?.status === 'pending';
  const isKycRejected = kycData?.status === 'rejected';

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
    if (amount >= 3001) {
      if (isKycPending) {
        return (
          <Alert className="mb-4 bg-amber-50 border-amber-300">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800">KYC Verification In Progress</AlertTitle>
            <AlertDescription className="text-amber-700">
              Your KYC verification is being reviewed. Crypto payments of $3,001 or more will be available once verification is approved.
            </AlertDescription>
          </Alert>
        );
      } else if (isKycRejected) {
        return (
          <Alert className="mb-4 bg-red-50 border-red-300">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800">KYC Verification Rejected</AlertTitle>
            <AlertDescription className="text-red-700">
              Your KYC verification was rejected. Please try again with valid documents to process crypto payments of $3,001 or more.
              <Button asChild variant="link" className="p-0 ml-2 text-red-700 font-medium">
                <Link to="/dashboard/kyc">Verify Now</Link>
              </Button>
            </AlertDescription>
          </Alert>
        );
      } else if (!kycData?.status || kycData?.status === 'not_started' || kycData?.status === 'needs_clarification') {
        return (
          <Alert className="mb-4 bg-amber-50 border-amber-300">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800">KYC Verification Required</AlertTitle>
            <AlertDescription className="text-amber-700">
              Crypto payments of $3,001 or more require KYC verification for regulatory compliance.
              <Button asChild variant="link" className="p-0 ml-2 text-amber-700 font-medium">
                <Link to="/dashboard/kyc">Verify Now</Link>
              </Button>
            </AlertDescription>
          </Alert>
        );
      }
    }
    return null;
  };

  const handleCoinPaymentWithCurrency = () => {
    handleCoinPaymentsPayment(amount, selectedCurrency);
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
                  disabled={isProcessing}
                  highlight={true} // New prop for highlighting
                />
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
                  disabled={isProcessing || isKycNeeded}
                  highlight={false}
                  cryptoHighlight={true} // New prop for crypto highlighting
                />
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
