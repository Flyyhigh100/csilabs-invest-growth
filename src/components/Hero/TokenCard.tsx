
import React from 'react';
import { Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriceChart, VolumeChart } from './TokenCharts';
import { TokenInfo } from '@/types/token';

interface TokenCardProps {
  isLoaded: boolean;
  priceData: any[];
  volumeData: any[];
  currentPrice: number | null;
  tokenInfo: TokenInfo | null;
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
  // Format the current price for display
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
            
            <Tabs defaultValue="price" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="grid grid-cols-2 w-40">
                  <TabsTrigger value="price">Price</TabsTrigger>
                  <TabsTrigger value="volume">Volume</TabsTrigger>
                </TabsList>
                <div className="flex items-center text-xs text-gray-500">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Powered by Defined.fi</span>
                </div>
              </div>
              
              <TabsContent value="price" className="mt-0">
                <PriceChart 
                  priceData={priceData} 
                  isLoading={isLoading} 
                  hasError={hasError} 
                />
              </TabsContent>
              
              <TabsContent value="volume" className="mt-0">
                <VolumeChart 
                  volumeData={volumeData} 
                  isLoading={isLoading} 
                  hasError={hasError} 
                />
              </TabsContent>
            </Tabs>
            
            <div className="flex flex-col gap-4 max-w-full mx-auto mt-6">
              <div className="flex justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Supply:</span>
                <span className="font-medium">{tokenInfo ? tokenInfo.totalSupply : 'Loading...'} CSL</span>
              </div>
              <div className="flex justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Blockchain:</span>
                <span className="font-medium">{tokenInfo ? tokenInfo.blockchain : 'Loading...'}</span>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Contract:</span>
                </div>
                <div className="text-gray-700 text-xs font-mono break-all overflow-hidden">
                  {tokenInfo ? tokenInfo.contractAddress : 'Loading...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -z-10 w-40 h-40 rounded-full bg-cbis-blue/10 -bottom-10 -left-10 blur-2xl"></div>
      <div className="absolute -z-10 w-60 h-60 rounded-full bg-cbis-teal/10 -top-10 -right-10 blur-3xl"></div>
    </div>
  );
};

export default TokenCard;
