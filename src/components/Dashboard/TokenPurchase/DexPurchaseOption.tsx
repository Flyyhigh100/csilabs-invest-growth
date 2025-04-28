
import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import PurchaseMethodCard from './components/PurchaseMethodCard';

interface DexPurchaseOptionProps {
  dexUrl?: string;
}

const DexPurchaseOption: React.FC<DexPurchaseOptionProps> = ({ 
  dexUrl = "https://app.uniswap.org/#/swap?outputCurrency=0xcba5ca199bca0af3f6046da01169035f2c6a7ff0&chain=polygon" 
}) => {
  const handleDexClick = () => {
    window.open(dexUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-medium">DEX Trading Option</h3>
      </div>
      
      <PurchaseMethodCard
        title="Buy on DEX"
        description="Purchase CSi tokens directly through a decentralized exchange."
        icon={<ExternalLink className="h-6 w-6" />}
        onClick={handleDexClick}
        buttonLabel="Trade on DEX"
        badgeText="External"
        badgeVariant="outline"
      >
        <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm">
            Trading on DEX occurs on the open market. Funds from DEX trades do not directly 
            support company operations. Prices may vary from official company rates with no guarantee 
            of fund destination.
          </AlertDescription>
        </Alert>
      </PurchaseMethodCard>
    </div>
  );
};

export default DexPurchaseOption;
