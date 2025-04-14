
import React from 'react';
import { Wallet, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import TokenCalculator from '../TokenPurchase/TokenCalculator';
import WalletRequiredAlert from '../WalletRequiredAlert';
import BuyTokensTab from '../BuyTokensTab';

export const TokenPurchaseSection: React.FC<{
  walletAddress: string | null;
}> = ({ walletAddress }) => {
  return (
    <Card className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-cbis-blue/10 p-2 rounded-full">
            <ArrowRight className="h-5 w-5 text-cbis-blue" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800">Step 2: Purchase Tokens</CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Choose your payment method and amount to purchase CSi tokens
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 rounded-sm pb-6">
        <WalletRequiredAlert walletAddress={walletAddress} />
        <BuyTokensTab walletAddress={walletAddress} />
      </CardContent>
    </Card>
  );
};
