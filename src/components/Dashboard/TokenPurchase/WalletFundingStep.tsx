
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WalletFundingStepProps {
  onComplete: () => void;
  onStartFunding: () => void;
  isExpanded: boolean;
}

const WalletFundingStep: React.FC<WalletFundingStepProps> = ({ 
  onComplete, 
  onStartFunding,
  isExpanded 
}) => {
  if (!isExpanded) {
    return null;
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm overflow-hidden border border-blue-200 transition-all hover:shadow-md">
      <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-500"></div>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <DollarSign className="h-5 w-5 text-cbis-blue" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800">Step 2: Fund Your Wallet</CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Add cryptocurrency to your wallet to purchase CSi tokens
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">How to Fund Your Wallet</h3>
          <ul className="space-y-3 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <div className="min-w-4 mt-0.5">1.</div>
              <p>Use Stripe Crypto to purchase cryptocurrency directly with your credit card, Apple Pay, or Google Pay.</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="min-w-4 mt-0.5">2.</div>
              <p>Recommended options: BTC, Ethereum, Polygon, Solana, USDC (on Polygon or Solana).</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="min-w-4 mt-0.5">3.</div>
              <p>Follow the Stripe process to complete your purchase and fund your wallet.</p>
            </li>
          </ul>
        </div>
        
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            Note: Some contributors may need to present identity documents to comply with our AML/KYC Policy.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            onClick={onStartFunding} 
            className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white sm:flex-1"
          >
            Fund My Wallet with Stripe
          </Button>
          <Button 
            variant="outline" 
            onClick={onComplete}
            className="sm:flex-1"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            I've already funded my wallet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletFundingStep;
