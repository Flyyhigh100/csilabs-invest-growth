
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from 'lucide-react';
import { usePaymentHandlers } from '@/hooks/payments';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { KycRequirementAlert } from './KycStatusAlerts';
import WalletRequiredAlert from './WalletRequiredAlert';
import ProcessingIndicator from './ProcessingIndicator';
import CryptoPaymentDialog from './TokenPurchase/CryptoPaymentDialog';
import TokenCalculator from './TokenPurchase/TokenCalculator';
import PaymentOptions from './TokenPurchase/PaymentOptions';
import WalletMissingContent from './TokenPurchase/WalletMissingContent';
import PurchaseGuide from './TokenPurchase/PurchaseGuide';
import { TokenPriceProvider, useTokenPrice } from '@/context/TokenPriceContext';

interface BuyTokensTabProps {
  walletAddress: string | null;
}

const BuyTokensTab: React.FC<BuyTokensTabProps> = ({
  walletAddress
}) => {
  const [amount, setAmount] = useState<number>(100);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
  const { kycData } = useKycVerification();
  
  // Wrap content that uses TokenPrice context with TokenPriceProvider
  const BuyTokensContent = () => {
    const { currentPrice } = useTokenPrice();
    
    const {
      isProcessing,
      showCryptoDialog,
      setShowCryptoDialog,
      cryptoPaymentDetails,
      handleStripePayment,
      handleCoinPaymentsPayment,
      kycRequired
    } = usePaymentHandlers(walletAddress);

    const isKycNeeded = kycRequired(amount) && kycData?.status !== 'approved';
    const isWalletMissing = !walletAddress;

    // Update this method to handle the boolean return value
    const handleStripePaymentWrapper = async (amount: number): Promise<void> => {
      // Pass current token price to the payment handler
      const success = await handleStripePayment(amount, currentPrice);
      // You can optionally do something with the success value here if needed
      if (!success) {
        console.error("Stripe payment was not successful");
      }
    };

    const handleCoinPaymentWithCurrency = () => {
      console.log('[BuyTokensTab] Initiating CoinPayments with amount:', amount, 'and selected currency:', selectedCurrency);
      // Pass current token price to the payment handler
      handleCoinPaymentsPayment(amount, selectedCurrency, currentPrice);
    };

    const handleDialogOpenChange = (show: boolean) => {
      setShowCryptoDialog(show);
    };

    return (
      <>
        {walletAddress ? (
          <>
            <PurchaseGuide />
            
            <TokenCalculator 
              amount={amount} 
              onChange={setAmount} 
              disabled={isProcessing} 
            />
            
            <KycRequirementAlert amount={amount} kycData={kycData} />
            
            <div className="mt-6">
              <h3 className="text-base font-medium mb-4 text-gray-700">Select Payment Method</h3>
              
              <PaymentOptions 
                amount={amount}
                selectedCurrency={selectedCurrency}
                setSelectedCurrency={setSelectedCurrency}
                handleStripePayment={handleStripePaymentWrapper}
                handleCoinPaymentWithCurrency={handleCoinPaymentWithCurrency}
                isProcessing={isProcessing}
                isKycNeeded={isKycNeeded}
                isWalletMissing={isWalletMissing}
                kycData={kycData}
              />
            </div>
            
            {isProcessing && <ProcessingIndicator />}
          </>
        ) : (
          <WalletMissingContent />
        )}
        
        <CryptoPaymentDialog 
          open={showCryptoDialog} 
          onOpenChange={handleDialogOpenChange} 
          paymentDetails={cryptoPaymentDetails}
          amount={amount} 
          selectedCurrency={selectedCurrency} 
        />
      </>
    );
  };

  return (
    <Card className="shadow-lg border-cbis-blue/10 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-cbis-blue to-cbis-teal"></div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-cbis-blue">
              <DollarSign className="h-5 w-5 text-cbis-teal" />
              Purchase CSi Tokens
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 border-blue-200">Test Mode</Badge>
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Choose your payment method and amount to purchase CSi tokens
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 rounded-sm pb-6">
        <TokenPriceProvider>
          <BuyTokensContent />
        </TokenPriceProvider>
      </CardContent>
    </Card>
  );
};

export default BuyTokensTab;
