import React from 'react';
import { useTokenPrice } from '@/context/TokenPriceContext';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { Spinner } from "@/components/ui/spinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
interface TokenPriceHeaderProps {
  className?: string;
}
const TokenPriceHeader: React.FC<TokenPriceHeaderProps> = ({
  className = ""
}) => {
  const {
    currentPrice,
    isLoading,
    lastUpdated,
    refreshPrice,
    error,
    dataSource
  } = useTokenPrice();
  console.log('TokenPriceHeader rendering with price:', currentPrice, 'loading:', isLoading, 'source:', dataSource);
  const formattedLastUpdated = lastUpdated ? lastUpdated.toLocaleTimeString() : 'Not yet updated';
  const isFallbackData = error !== null;

  // Determine source badge color
  const getSourceBadgeVariant = () => {
    switch (dataSource) {
      case 'on-chain':
      case 'on-chain-v4':
      case 'on-chain-v3':
        return "success";
      case 'defined.fi':
      case 'dexscreener':
        return "warning";
      case 'cache':
        return "outline";
      default:
        return "secondary";
    }
  };

  // Format the data source name for display
  const getSourceDisplayName = () => {
    switch (dataSource) {
      case 'on-chain':
        return "Uniswap V4 TWAP";
      case 'on-chain-v4':
        return "Uniswap V4 Spot";
      case 'on-chain-v3':
        return "Uniswap V3 TWAP";
      case 'defined.fi':
        return "Defined.fi API";
      case 'dexscreener':
        return "DexScreener API";
      case 'cache':
        return "Cached Data";
      default:
        return "Unknown Source";
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
  return <Card className={`flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-cbis-blue mr-2" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-600">CSi Labs (CSL) Current Spot Price </p>
              {dataSource && <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0 rounded-full hover:bg-blue-50 focus-visible:ring-1 focus-visible:ring-blue-400" aria-label="Price Source Information">
                      
                      <Info className="h-3.5 w-3.5 opacity-70" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" sideOffset={10} align="start" className="z-[100] bg-white shadow-lg">
                    <p className="text-xs">{getSourceTooltip()}</p>
                  </PopoverContent>
                </Popover>}
              {isFallbackData && <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                  Historical Data
                </Badge>}
            </div>
            <div className="flex items-center">
              <p className="text-lg font-bold text-cbis-blue">
                {isLoading ? <span className="flex items-center">
                    <Spinner className="h-4 w-4 mr-2" />
                    Loading...
                  </span> : currentPrice ? `$${currentPrice.toFixed(5)} USD` : 'Price unavailable'}
              </p>
              
              {dataSource?.includes('on-chain') && !isLoading && currentPrice && <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0 ml-2 rounded-full hover:bg-blue-50 focus-visible:ring-1 focus-visible:ring-blue-400" aria-label="Time-Weighted Average Price Information">
                      <Info className="h-4 w-4 text-blue-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" sideOffset={15} align="start" className="max-w-[300px] p-3 z-[100] bg-white shadow-xl border border-gray-200">
                    <p className="text-sm font-medium mb-1">What is TWAP?</p>
                    <p className="text-xs text-gray-600 mb-2">
                      This price is a <strong>Time-Weighted Average Price</strong> calculated over a 15-minute period.
                    </p>
                    <p className="text-xs text-gray-600">
                      TWAP provides a more stable price than instant spot prices, making it resistant to short-term price manipulation and volatility.
                    </p>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-500 mt-2">
                          Learn more
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 z-[150]" side="bottom" sideOffset={5} align="start">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">About Time-Weighted Average Price (TWAP)</h4>
                          <p className="text-xs text-gray-600">
                            TWAP is calculated by averaging price data points over a 15-minute window, giving equal weight to each time interval.
                          </p>
                          <div className="space-y-1 mt-2">
                            <p className="text-xs font-medium">Why TWAP may differ from chart prices:</p>
                            <ul className="text-xs text-gray-600 space-y-1 pl-4 list-disc">
                              <li>Charts often show spot prices (instantaneous prices)</li>
                              <li>TWAP smooths out short-term price fluctuations</li>
                              <li>During volatile markets, the difference can be significant</li>
                            </ul>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-600">
                              <strong>Why we use TWAP:</strong> It provides a fair pricing mechanism that reduces the impact of temporary price swings and market manipulation attempts.
                            </p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </PopoverContent>
                </Popover>}
            </div>
            {error && <p className="text-xs text-amber-600 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                Using latest historical price
              </p>}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <Button variant="outline" size="sm" onClick={refreshPrice} disabled={isLoading} className="mb-1">
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <div className="text-xs text-gray-500">
          <span>Last updated: {formattedLastUpdated}</span>
          {dataSource && <span className={`ml-2 ${dataSource?.includes('on-chain') ? 'text-green-600' : dataSource === 'defined.fi' || dataSource === 'dexscreener' ? 'text-amber-600' : 'text-blue-600'}`}>via {getSourceDisplayName()}</span>}
        </div>
      </div>
    </Card>;
};
export default TokenPriceHeader;