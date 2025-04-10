
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from 'lucide-react';
import { usePaymentHandlers } from '@/hooks/payments';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { KycRequirementAlert } from './KycStatusAlerts';
import WalletRequiredAlert from './WalletRequiredAlert';
import ProcessingIndicator from './ProcessingIndicator';
import CryptoPaymentDialog from './TokenPurchase/CryptoPaymentDialog';
import TokenCalculator from './TokenPurchase/TokenCalculator';
import PaymentTabs from './TokenPurchase/PaymentTabs';
import WalletMissingContent from './TokenPurchase/WalletMissingContent';
import PurchaseGuide from './TokenPurchase/PurchaseGuide';
import TestModeFooter from './TokenPurchase/TestModeFooter';

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

  const isKycNeeded = kycRequired(amount) && kycData?.status !== 'approved';
  const isWalletMissing = !walletAddress;

  const handleCoinPaymentWithCurrency = () => {
    handleCoinPaymentsPayment(amount, selectedCurrency);
  };

  const handleDialogOpenChange = (show: boolean) => {
    setShowCryptoDialog(show);
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
              
              <PaymentTabs 
                amount={amount}
                selectedCurrency={selectedCurrency}
                setSelectedCurrency={setSelectedCurrency}
                handleStripePayment={handleStripePayment}
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
      </CardContent>
      
      <TestModeFooter />
      
      <CryptoPaymentDialog 
        open={showCryptoDialog} 
        onOpenChange={handleDialogOpenChange} 
        paymentDetails={cryptoPaymentDetails}
        amount={amount} 
        selectedCurrency={selectedCurrency} 
      />
    </Card>
  );
};

export default BuyTokensTab;
