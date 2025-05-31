
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, ArrowRightCircle, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import PurchaseMethodCard from './components/PurchaseMethodCard';

// Define the CSI Token URLs as constants
const CSI_TOKEN_POLYGON_URL = 'https://app.uniswap.org/explore/tokens/polygon/0xcba5ca199bca0af3f6046da01169035f2c6a7ff0';
const CSI_TOKEN_SOLANA_URL = 'https://raydium.io/swap/?inputCurrency=SOL&outputCurrency=3iU6Upm7bSx7VYFLfxsTGP1qmPCy6A7v6ddkmeNQtLqD&inputMint=3iU6Upm7bSx7VYFLfxsTGP1qmPCy6A7v6ddkmeNQtLqD&outputMint=sol';

interface PurchasePathSelectorProps {
  amount: number;
  isProcessing: boolean;
  isWalletMissing: boolean;
  onSelectCoinPayments: () => void;
  onSelectDex: () => void;
  setDirectPurchase?: (isDirectPurchase: boolean) => void;
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
  
  // Enhanced handler that opens the Polygon Uniswap token URL directly
  const handleSelectPolygonDex = () => {
    window.open(CSI_TOKEN_POLYGON_URL, '_blank');
    onSelectDex(); // Still call the original handler for any other side effects
  };

  // Handler for Solana DEX
  const handleSelectSolanaDex = () => {
    window.open(CSI_TOKEN_SOLANA_URL, '_blank');
    onSelectDex(); // Still call the original handler for any other side effects
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-medium">Select Your Preferred Purchase Method</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose how you'd like to purchase your CSi tokens
        </p>
      </div>
      
      {/* Increased gap between cards and improved grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PurchaseMethodCard 
          title="Direct Charitable Contribution" 
          description="Buy Direct @ Current Spot price directly from CSi Labs. Funds support company operations and development."
          icon={<DollarSign className="h-6 w-6" />} 
          onClick={handleSelectCoinPayments} 
          buttonLabel="Contribute Now" 
          disabled={isProcessing || isWalletMissing} 
          highlight={true} 
          badgeText="Limited Time Pre-launch Special!" 
          badgeVariant="secondary" 
        />
        
        <PurchaseMethodCard 
          title="Decentralized Exchange (DEX)" 
          description="For advanced users. Purchase CSi tokens directly on a decentralized exchange at market prices." 
          icon={<ArrowRightCircle className="h-6 w-6" />} 
          onClick={() => {}} // Placeholder since we have custom buttons
          buttonLabel="" // No single button
          disabled={false} 
          badgeText="Advanced" 
          badgeVariant="outline"
        >
          <div className="space-y-2 mt-2">
            <Button 
              onClick={handleSelectPolygonDex}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              size="sm"
            >
              Go to Polygon DEX
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button 
              onClick={handleSelectSolanaDex}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              size="sm"
            >
              Go to SOLANA DEX
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </PurchaseMethodCard>
      </div>
      
      <Separator className="my-4" />
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-sm mb-2">Why choose Direct Charitable Contribution?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Funds directly support company operations and development</li>
          <li>• Simplified process with customer support</li>
          <li>• Direct relationship to CSi Labs</li>
          <li>• Limited time pre-launch pricing available</li>
        </ul>
      </div>
    </div>
  );
};

export default PurchasePathSelector;
