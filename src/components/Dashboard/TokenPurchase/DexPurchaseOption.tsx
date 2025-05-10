
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DexPurchaseOptionProps {
  className?: string;
}

const DexPurchaseOption: React.FC<DexPurchaseOptionProps> = ({ className }) => {
  return (
    <div className={className}>
      <div className="flex flex-col gap-1 mb-4">
        <h3 className="text-lg font-medium">Advanced Option: Decentralized Exchange (DEX)</h3>
        <p className="text-sm text-gray-600">
          For experienced crypto users only. Purchase CSi tokens directly on a decentralized exchange.
        </p>
      </div>
      
      <Alert variant="default" className="bg-amber-50 border-amber-200 mb-4">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-700">
          <strong>Note:</strong> When purchasing via DEX, funds do not go directly to the company. We recommend the direct purchase options above to support company operations.
        </AlertDescription>
      </Alert>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium mb-3">Available exchanges:</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium">QuickSwap (Polygon)</p>
              <p className="text-xs text-gray-600">Recommended DEX for Polygon network</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.open('https://quickswap.exchange/', '_blank')} className="flex-shrink-0">
              Visit <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium">Uniswap</p>
              <p className="text-xs text-gray-600">Popular multi-chain DEX</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.open('https://app.uniswap.org/', '_blank')} className="flex-shrink-0">
              Visit <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>For DEX trading, you'll need to have the token contract address:</p>
        <p className="font-mono mt-1 bg-gray-100 p-2 rounded-sm border border-gray-200 text-gray-700 overflow-auto whitespace-normal break-all">0xcba5ca199bca0af3f6046da01169035f2c6a7ff0</p>
      </div>
    </div>
  );
};

export default DexPurchaseOption;
