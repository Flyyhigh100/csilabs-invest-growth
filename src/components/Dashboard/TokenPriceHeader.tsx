
import React from 'react';
import { useTokenPrice } from '@/context/TokenPriceContext';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TokenPriceHeaderProps {
  className?: string;
}

const TokenPriceHeader: React.FC<TokenPriceHeaderProps> = ({ className = "" }) => {
  const { 
    currentPrice, 
    isLoading, 
    lastUpdated, 
    refreshPrice,
    error,
    dataSource 
  } = useTokenPrice();
  
  console.log('TokenPriceHeader rendering with price:', currentPrice, 'loading:', isLoading, 'source:', dataSource);
  
  const formattedLastUpdated = lastUpdated 
    ? lastUpdated.toLocaleTimeString() 
    : 'Not yet updated';

  const isFallbackData = error !== null;

  // Determine source badge color
  const getSourceBadgeVariant = () => {
    switch(dataSource) {
      case 'on-chain':
      case 'on-chain-v4':
      case 'on-chain-v3':
        return "success";
      case 'defined.fi':
      case 'dexscreener':
        return "warning";
      case 'cache':
        return "outline";
      default: return "secondary";
    }
  };

  // Format the data source name for display
  const getSourceDisplayName = () => {
    switch(dataSource) {
      case 'on-chain': return "Uniswap V4 TWAP";
      case 'on-chain-v4': return "Uniswap V4 Spot";
      case 'on-chain-v3': return "Uniswap V3 TWAP";
      case 'defined.fi': return "Defined.fi API";
      case 'dexscreener': return "DexScreener API";
      case 'cache': return "Cached Data";
      default: return "Unknown Source";
    }
  };

  // Helper function for tooltip content
  const getSourceTooltip = () => {
    if (dataSource?.includes('on-chain')) {
      return "Price data comes directly from the blockchain - highest reliability";
    } else if (dataSource === 'defined.fi' || dataSource === 'dexscreener') {
      return "Price data comes from third-party API - medium reliability";
    } else if (dataSource === 'cache') {
      return "Using cached price data - may be outdated";
    } else {
      return "Source information unavailable";
    }
  };

  return (
    <Card className={`flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-cbis-blue mr-2" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-600">Current CSi Token Price</p>
              {dataSource && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Badge variant={getSourceBadgeVariant()} className="text-xs">
                          {getSourceDisplayName()}
                        </Badge>
                        <Info className="h-3.5 w-3.5 ml-0.5 opacity-70" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">{getSourceTooltip()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isFallbackData && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                  Historical Data
                </Badge>
              )}
            </div>
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
            {error && (
              <p className="text-xs text-amber-600 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                Using latest historical price
              </p>
            )}
          </div>
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
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <div className="text-xs text-gray-500">
          <span>Last updated: {formattedLastUpdated}</span>
          {dataSource && (
            <span className={`ml-2 ${
              dataSource?.includes('on-chain') ? 'text-green-600' :
              dataSource === 'defined.fi' || dataSource === 'dexscreener' ? 'text-amber-600' : 
              'text-blue-600'
            }`}>via {getSourceDisplayName()}</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TokenPriceHeader;
