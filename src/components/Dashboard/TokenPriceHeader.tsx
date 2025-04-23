
import React from 'react';
import { useTokenPrice } from '@/context/TokenPriceContext';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp } from 'lucide-react';
import { Spinner } from "@/components/ui/spinner";

interface TokenPriceHeaderProps {
  className?: string;
}

const TokenPriceHeader: React.FC<TokenPriceHeaderProps> = ({ className = "" }) => {
  const { 
    currentPrice, 
    isLoading, 
    lastUpdated, 
    refreshPrice 
  } = useTokenPrice();
  
  // Format the last updated time
  const formattedLastUpdated = lastUpdated 
    ? lastUpdated.toLocaleTimeString() 
    : 'Not yet updated';

  return (
    <Card className={`flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 ${className}`}>
      <div className="flex items-center">
        <TrendingUp className="h-5 w-5 text-cbis-blue mr-2" />
        <div>
          <p className="text-sm font-medium text-gray-600">Current CSi Token Price</p>
          <p className="text-lg font-bold text-cbis-blue">
            {isLoading ? (
              <span className="flex items-center">
                <Spinner className="h-4 w-4 mr-2" />
                Loading...
              </span>
            ) : currentPrice ? (
              `$${currentPrice.toFixed(5)} USD`
            ) : (
              'Price unavailable'
            )}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshPrice}
          disabled={isLoading}
          className="mb-1"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
        <p className="text-xs text-gray-500">Last updated: {formattedLastUpdated}</p>
      </div>
    </Card>
  );
};

export default TokenPriceHeader;
