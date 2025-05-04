
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, ArrowRightCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PurchaseMethodCard from './components/PurchaseMethodCard';

interface PurchasePathSelectorProps {
  amount: number;
  isProcessing: boolean;
  isWalletMissing: boolean;
  onSelectCoinPayments: () => void;
  onSelectDex: () => void;
  setDirectPurchase?: (isDirectPurchase: boolean) => void; // New prop for setting direct purchase
}

const PurchasePathSelector: React.FC<PurchasePathSelectorProps> = ({
  amount,
  isProcessing,
  isWalletMissing,
  onSelectCoinPayments,
  onSelectDex,
  setDirectPurchase
}) => {
  // Enhanced handler that sets direct purchase flag
  const handleSelectCoinPayments = () => {
    if (setDirectPurchase) {
      setDirectPurchase(true); // Set direct purchase flag to true
    }
    onSelectCoinPayments();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-medium">Select Your Preferred Purchase Method</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose how you'd like to purchase your CSi tokens
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PurchaseMethodCard
          title="Direct Company Purchase"
          description="Purchase directly from CSi using CoinPayments. Funds support company operations and development."
          icon={<DollarSign className="h-6 w-6" />}
          onClick={handleSelectCoinPayments}
          buttonLabel={`Contribute $${amount}`}
          disabled={isProcessing || isWalletMissing}
          highlight={true}
          badgeText="Recommended"
          badgeVariant="secondary"
        />
        
        <PurchaseMethodCard
          title="Decentralized Exchange (DEX)"
          description="For advanced users. Purchase CSi tokens directly on a decentralized exchange."
          icon={<ArrowRightCircle className="h-6 w-6" />}
          onClick={onSelectDex}
          buttonLabel="Go to DEX"
          disabled={false}
          badgeText="Advanced"
          badgeVariant="outline"
        />
      </div>
      
      <Separator className="my-4" />
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-sm mb-2">Why choose Direct Company Purchase?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Funds directly support company operations and development</li>
          <li>• Simplified process with guided support</li>
          <li>• Direct relationship with CSi</li>
        </ul>
      </div>
    </div>
  );
};

export default PurchasePathSelector;
