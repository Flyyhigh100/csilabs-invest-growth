
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from 'lucide-react';
import { usePaymentHandlers } from '@/hooks/payments';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { KycRequirementAlert } from './KycStatusAlerts';
import ProcessingIndicator from './ProcessingIndicator';
import CryptoPaymentDialog from './TokenPurchase/CryptoPaymentDialog';
import TokenCalculator from './TokenPurchase/TokenCalculator';
import WalletMissingContent from './TokenPurchase/WalletMissingContent';
import PurchaseGuide from './TokenPurchase/PurchaseGuide';
import { TokenPriceProvider, useTokenPrice } from '@/context/TokenPriceContext';
import PaymentTabs from './TokenPurchase/PaymentTabs';
import CryptoPaymentTab from './TokenPurchase/CryptoPaymentTab';

interface BuyTokensTabProps {
  walletAddress: string | null;
  isDirectPurchase?: boolean; // Prop to indicate direct purchase flow
}

const BuyTokensTab: React.FC<BuyTokensTabProps> = ({
  walletAddress,
  isDirectPurchase = false // Default to false if not provided
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
      handleStripeCryptoOnramp,
      handleCoinPaymentsPayment,
      kycRequired
    } = usePaymentHandlers(walletAddress);

    const isKycNeeded = kycRequired(amount) && kycData?.status !== 'approved';
    const isWalletMissing = !walletAddress;

    // Update the wrapper to return the complete result object
    const handleStripeCryptoOnrampWrapper = async () => {
      // Pass current token price to the payment handler
      return await handleStripeCryptoOnramp(amount, currentPrice);
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
              <h3 className="text-base font-medium mb-4 text-gray-700">
                {isDirectPurchase ? "CoinPayments Purchase" : "Select Payment Method"}
              </h3>
              
              {isDirectPurchase ? (
                // When direct purchase is selected, only show CryptoPaymentTab
                <div className="border rounded-lg p-4 border-blue-100 bg-blue-50/20">
                  <CryptoPaymentTab 
                    amount={amount}
                    selectedCurrency={selectedCurrency}
                    setSelectedCurrency={setSelectedCurrency}
                    handleCoinPaymentWithCurrency={handleCoinPaymentWithCurrency}
                    isProcessing={isProcessing}
                    isKycNeeded={isKycNeeded}
                    isWalletMissing={isWalletMissing}
                    kycData={kycData}
                  />
                </div>
              ) : (
                // Regular flow shows payment tabs
                <PaymentTabs 
                  amount={amount}
                  selectedCurrency={selectedCurrency}
                  setSelectedCurrency={setSelectedCurrency}
                  walletAddress={walletAddress}
                  handleStripeCryptoOnramp={handleStripeCryptoOnrampWrapper}
                  handleCoinPaymentWithCurrency={handleCoinPaymentWithCurrency}
                  isProcessing={isProcessing}
                  isKycNeeded={isKycNeeded}
                  isWalletMissing={isWalletMissing}
                  kycData={kycData}
                />
              )}
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
