
import React from 'react';
import { Info } from 'lucide-react';
import { TokenInfo as TokenInfoType } from '@/types/token';
import DexToolsChart from '@/components/TokenPricing/DexToolsChart';
import TokenInfo from './TokenInfo';
import { useTokenPrice } from '@/context/TokenPriceContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TokenCardProps {
  isLoaded: boolean;
  priceData: any[];
  volumeData: any[];
  currentPrice: number | null;
  tokenInfo: TokenInfoType | null;
  isLoading: boolean;
  hasError: boolean;
}

const TokenCard: React.FC<TokenCardProps> = ({ 
  isLoaded, 
  priceData, 
  volumeData, 
  currentPrice, 
  tokenInfo, 
  isLoading, 
  hasError 
}) => {
  const formattedCurrentPrice = currentPrice 
    ? `$${currentPrice.toFixed(5)}` 
    : 'Loading...';
  
  // Get data source from TokenPriceContext to determine if it's on-chain
  const { dataSource } = useTokenPrice();
  const isOnChainSource = dataSource?.includes('on-chain');

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-elevation bg-white">
      <div className="rounded-xl overflow-hidden bg-gradient-to-br from-cbis-blue/10 to-cbis-teal/10">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent mb-3">$CSi-EDP/Labs</div>
            <p className="text-cbis-dark">CSi Labs Token (CSL)</p>
            {currentPrice && (
              <p className="text-lg font-medium mt-2 flex items-center justify-center gap-1">
                {formattedCurrentPrice}
                
                {isOnChainSource && (
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <Info className="h-4 w-4 text-blue-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="bottom" 
                        sideOffset={15} 
                        align="center" 
                        className="max-w-[300px] p-3 z-[100] bg-white shadow-xl border border-gray-200"
                      >
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
                          <PopoverContent 
                            className="w-80 z-[150]" 
                            side="bottom" 
                            sideOffset={5}
                            align="start"
                          >
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
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </p>
            )}
          </div>
          
          <div className="h-[400px] mb-6">
            <DexToolsChart />
          </div>
          
          <TokenInfo tokenInfo={tokenInfo} isLoading={isLoading} />
        </div>
      </div>
      
      <div className="absolute -z-10 w-40 h-40 rounded-full bg-cbis-blue/10 -bottom-10 -left-10 blur-2xl"></div>
      <div className="absolute -z-10 w-60 h-60 rounded-full bg-cbis-teal/10 -top-10 -right-10 blur-3xl"></div>
    </div>
  );
};

export default TokenCard;
