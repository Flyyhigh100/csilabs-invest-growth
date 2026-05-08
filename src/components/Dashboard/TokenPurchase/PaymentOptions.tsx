
import React, { useState } from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KycVerificationData } from '@/hooks/kyc/types';
import CryptoOnrampTab from './CryptoOnrampTab';
import CryptoPaymentTab from './CryptoPaymentTab';
import CompanyPurchaseMethods from './CompanyPurchaseMethods';
import WhiteGloveServiceOption from './WhiteGloveServiceOption';
import { Separator } from "@/components/ui/separator";

interface PaymentOptionsProps {
  amount: number;
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  walletAddress: string | null;
  handleStripeCryptoOnramp: () => Promise<{success: boolean, clientSecret?: string, sessionId?: string}>;
  handleCoinPaymentWithCurrency: () => void;
  isProcessing: boolean;
  isKycNeeded: boolean;
  isWalletMissing: boolean;
  kycData: KycVerificationData | null;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  amount,
  selectedCurrency,
  setSelectedCurrency,
  walletAddress,
  handleStripeCryptoOnramp,
  handleCoinPaymentWithCurrency,
  isProcessing,
  isKycNeeded,
  isWalletMissing,
  kycData
}) => {
  const [showCryptoDetails, setShowCryptoDetails] = useState(false);
  const [paymentType, setPaymentType] = useState<'stripe' | 'coinpayments' | null>(null);
  
  // Handle selection of different payment methods
  const handleStripeSelected = () => {
    if (!isWalletMissing && !isProcessing) {
      setPaymentType('stripe');
      setShowCryptoDetails(true);
    }
  };
  
  const handleCryptoSelected = () => {
    if (!isWalletMissing && !isProcessing) {
      setPaymentType('coinpayments');
      setShowCryptoDetails(true);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Company purchase methods (Stripe and CoinPayments) */}
      <CompanyPurchaseMethods 
        amount={amount}
        isProcessing={isProcessing}
        isWalletMissing={isWalletMissing}
        onSelectStripe={handleStripeSelected}
        onSelectCrypto={handleCryptoSelected}
      />
      
      {/* Crypto payment details section - only shown when a payment method is selected */}
      {showCryptoDetails && (
        <Tabs defaultValue={paymentType === 'stripe' ? 'stripe' : 'crypto'} className="w-full mt-6">
          <TabsList className="grid grid-cols-1 w-full max-w-md mx-auto mb-4 bg-gray-100">
            {paymentType === 'stripe' ? (
              <TabsTrigger value="stripe" className="data-[state=active]:bg-blue-50 data-[state=active]:text-cbis-blue">
                <CreditCard className="mr-2 h-4 w-4" />
                Buy Crypto with Card
              </TabsTrigger>
            ) : (
              <TabsTrigger value="crypto" className="data-[state=active]:bg-blue-50 data-[state=active]:text-cbis-blue">
                <Wallet className="mr-2 h-4 w-4" />
                Crypto Payment Options
              </TabsTrigger>
            )}
          </TabsList>
          
          {paymentType === 'stripe' ? (
            <TabsContent value="stripe" className="border rounded-lg p-4 border-blue-100 bg-blue-50/20">
              <CryptoOnrampTab 
                amount={amount}
                walletAddress={walletAddress || ''}
                isProcessing={isProcessing}
                isWalletMissing={isWalletMissing}
                onInitiateOnramp={handleStripeCryptoOnramp}
              />
            </TabsContent>
          ) : (
            <TabsContent value="crypto" className="border rounded-lg p-4 border-blue-100 bg-blue-50/20">
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
            </TabsContent>
          )}
        </Tabs>
      )}
      
      <Separator className="my-8" />

      {/* White Glove VIP service */}
      <WhiteGloveServiceOption />

      {/* Educational content */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-medium text-base mb-3">Understanding Your Purchase Options</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Direct Purchase (Card/Crypto):</strong> Funds go directly to the company, supporting research, development, and operations.</p>
          <p><strong>White Glove Service:</strong> For contributions of $10,000+, our VIP concierge team provides bank wire instructions and personalized support.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;
