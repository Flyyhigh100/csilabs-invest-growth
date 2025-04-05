
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, CreditCard, CreditCardIcon, AlertTriangle, DollarSign, HelpCircle, CheckCircle, Wallet } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import PaymentOption from './PaymentOption';
import PurchaseAmountInput from './PurchaseAmountInput';
import ProcessingIndicator from './ProcessingIndicator';
import CryptoPaymentDialog from './CryptoPaymentDialog';
import { usePaymentHandlers } from '@/hooks/usePaymentHandlers';
import { useKycVerification } from '@/hooks/kyc/useKycVerification';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      return (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-700 font-medium">Wallet Address Required</AlertTitle>
          <AlertDescription className="text-red-600">
            Please add your Polygon wallet address above before proceeding with payment.
            <br />
            <span className="text-sm font-medium">Your tokens will be sent to this address after purchase.</span>
          </AlertDescription>
        </Alert>
      );
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

  // Calculate how many tokens they will receive based on token price ($0.05)
  const tokenAmount = amount / 0.05;
  
  const paymentMethods = [
    { 
      id: "card", 
      title: "Credit/Debit Card", 
      description: "Pay securely with Stripe using any major credit or debit card", 
      icon: <CreditCard className="h-6 w-6 text-cbis-blue" />, 
      isRecommended: true, 
      isKycRequired: false,
      badge: "Popular",
      badgeColor: "bg-green-100 text-green-800"
    },
    { 
      id: "crypto", 
      title: "Cryptocurrency", 
      description: "Pay with your preferred cryptocurrency through CoinPayments", 
      icon: <Wallet className="h-6 w-6 text-cbis-blue" />, 
      isRecommended: false, 
      isKycRequired: amount >= 3001,
      badge: amount >= 3001 ? "KYC Required" : undefined,
      badgeColor: "bg-amber-100 text-amber-800"
    }
  ];

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
      
      <CardContent className="space-y-6 rounded-sm pb-8">
        {renderWalletAlert()}
        
        {walletAddress && (
          <>
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">How purchasing works</h3>
              <ol className="text-sm text-blue-700 list-decimal pl-5 space-y-2">
                <li className="pl-1">Enter the amount you want to invest</li>
                <li className="pl-1">Choose your preferred payment method</li>
                <li className="pl-1">Complete the payment process</li>
                <li className="pl-1">CSi tokens will be sent to your wallet address</li>
              </ol>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium" htmlFor="amount-input">Investment Amount (USD)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-sm">This is the amount in USD you wish to invest. The number of tokens you'll receive depends on the current token price ($0.05).</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <PurchaseAmountInput amount={amount} onChange={setAmount} disabled={isProcessing} />
              
              <div className="px-1 py-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">You will receive approximately:</span>
                  <span className="font-medium text-cbis-blue">{tokenAmount.toLocaleString()} CSi Tokens</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current token price:</span>
                  <span className="font-medium text-cbis-blue">$0.05 USD</span>
                </div>
              </div>
            </div>
            
            {renderKycAlert()}
            
            <div className="mt-8">
              <h3 className="text-base font-medium mb-3 text-gray-700">Select Payment Method</h3>
              
              <Tabs defaultValue="card" className="w-full">
                <TabsList className="grid grid-cols-2 w-full mb-4">
                  <TabsTrigger value="card" className="data-[state=active]:bg-blue-50 data-[state=active]:text-cbis-blue">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Card Payment
                  </TabsTrigger>
                  <TabsTrigger value="crypto" className="data-[state=active]:bg-blue-50 data-[state=active]:text-cbis-blue">
                    <Wallet className="mr-2 h-4 w-4" />
                    Crypto Payment
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="card" className="border rounded-lg p-4 border-blue-100 bg-blue-50/30">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-white p-2 rounded-full border border-gray-200">
                        <CreditCard className="h-6 w-6 text-cbis-blue" />
                      </div>
                      <div>
                        <h4 className="font-medium">Credit/Debit Card Payment</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Fast and secure payment using Stripe. No KYC verification required.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total amount:</p>
                        <p className="text-lg font-medium">${amount.toLocaleString()}</p>
                      </div>
                      <Button 
                        onClick={() => handleStripePayment(amount)} 
                        disabled={isProcessing || !walletAddress}
                        className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white"
                      >
                        Proceed to Payment
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Secure payment processing by Stripe</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="crypto" className="border rounded-lg p-4 border-blue-100 bg-blue-50/30">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-white p-2 rounded-full border border-gray-200">
                        <Wallet className="h-6 w-6 text-cbis-blue" />
                      </div>
                      <div>
                        <h4 className="font-medium">Cryptocurrency Payment</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Pay with your preferred cryptocurrency. KYC required for amounts $3,001 or more.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <Label htmlFor="crypto-currency" className="text-sm text-cbis-blue font-medium">Select Cryptocurrency</Label>
                      <Select value={selectedCurrency} onValueChange={setSelectedCurrency} disabled={isProcessing}>
                        <SelectTrigger id="crypto-currency" className="border-2 border-cbis-teal/30 bg-white focus:ring-2 focus:ring-cbis-blue focus:border-cbis-blue transition-all">
                          <SelectValue placeholder="Select cryptocurrency" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-2 border-cbis-teal/30 shadow-lg z-50">
                          <SelectItem value="USDT" className="hover:bg-blue-50">USDT (Tether)</SelectItem>
                          <SelectItem value="BTC" className="hover:bg-blue-50">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH" className="hover:bg-blue-50">Ethereum (ETH)</SelectItem>
                          <SelectItem value="DOGE" className="hover:bg-blue-50">Dogecoin (DOGE)</SelectItem>
                          <SelectItem value="XRP" className="hover:bg-blue-50">Ripple (XRP)</SelectItem>
                          <SelectItem value="LTCT" className="hover:bg-blue-50">Litecoin Testnet (LTCT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total amount:</p>
                        <p className="text-lg font-medium">${amount.toLocaleString()}</p>
                      </div>
                      <Button 
                        onClick={handleCoinPaymentWithCurrency} 
                        disabled={isProcessing || !walletAddress || isKycNeeded}
                        className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white"
                      >
                        Pay with {selectedCurrency}
                      </Button>
                    </div>
                    
                    {amount >= 3001 && kycData?.status !== 'approved' && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>KYC verification required for amounts $3,001 or more</span>
                      </div>
                    )}
                    
                    {(amount < 3001 || kycData?.status === 'approved') && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Secure payment processing by CoinPayments</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {isProcessing && <ProcessingIndicator />}
          </>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 p-4 border-t border-gray-200">
        <Alert className="w-full bg-blue-50 text-blue-800 border-blue-200">
          <Info className="h-5 w-5" />
          <AlertTitle>Test Mode Active</AlertTitle>
          <AlertDescription>
            For testing, use Stripe test card: 4242 4242 4242 4242, any future date, any 3 digits CVC, and any postal code.
          </AlertDescription>
        </Alert>
      </CardFooter>
      
      <CryptoPaymentDialog 
        open={showCryptoDialog} 
        onOpenChange={setShowCryptoDialog} 
        paymentDetails={cryptoPaymentDetails}
        amount={amount} 
        selectedCurrency={selectedCurrency} 
      />
    </Card>
  );
};

export default BuyTokensTab;
