
import React from 'react';
import { Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriceChart, VolumeChart } from './TokenCharts';
import TokenInfo from './TokenInfo';
import { TokenInfo as TokenInfoType } from '@/types/token';
import DexToolsChart from '@/components/TokenPricing/DexToolsChart';

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

  return (
    <div className={`relative transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      <div className="relative rounded-2xl overflow-hidden shadow-elevation bg-white p-2">
        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-cbis-blue/10 to-cbis-teal/10">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cbis-blue to-cbis-teal bg-clip-text text-transparent mb-3">$CSi-EDP/Labs</div>
              <p className="text-cbis-dark">CSi Labs Token (CSL)</p>
              {currentPrice && (
                <p className="text-lg font-medium mt-2">{formattedCurrentPrice}</p>
              )}
            </div>
            
            <div className="h-[400px] mb-6">
              <DexToolsChart />
            </div>
            
            <TokenInfo tokenInfo={tokenInfo} isLoading={isLoading} />
          </div>
        </div>
      </div>
      
      <div className="absolute -z-10 w-40 h-40 rounded-full bg-cbis-blue/10 -bottom-10 -left-10 blur-2xl"></div>
      <div className="absolute -z-10 w-60 h-60 rounded-full bg-cbis-teal/10 -top-10 -right-10 blur-3xl"></div>
    </div>
  );
};

export default TokenCard;
