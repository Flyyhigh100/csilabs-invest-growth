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
  // Get data source from TokenPriceContext to determine if it's on-chain
  const {
    dataSource
  } = useTokenPrice();
  const isOnChainSource = dataSource?.includes('on-chain');
  return <div className="relative rounded-2xl overflow-hidden shadow-elevation bg-white">
      <div className="rounded-xl overflow-hidden bg-gradient-to-br from-cbis-blue/10 to-cbis-teal/10">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent mb-3">$CSi-EDP/Labs</div>
            
          </div>
          
          {/* Chart container with responsive height and padding */}
          <div className="h-auto mb-8 sm:mb-10">
            <DexToolsChart />
          </div>
          
          {/* Increased spacing before TokenInfo */}
          <div className="mt-8 pt-2 sm:mt-10">
            <TokenInfo tokenInfo={tokenInfo} isLoading={isLoading} />
          </div>
        </div>
      </div>
      
      <div className="absolute -z-10 w-40 h-40 rounded-full bg-cbis-blue/10 -bottom-10 -left-10 blur-2xl"></div>
      <div className="absolute -z-10 w-60 h-60 rounded-full bg-cbis-teal/10 -top-10 -right-10 blur-3xl"></div>
    </div>;
};
export default TokenCard;