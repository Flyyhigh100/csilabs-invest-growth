
import React, { useEffect, useState } from 'react';
import HeroContent from './HeroContent';
import TokenCard from './TokenCard';
import { useTokenData } from '@/hooks/useTokenData';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import DexToolsChart from '@/components/TokenPricing/DexToolsChart';

const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { priceData, volumeData, currentPrice, tokenInfo, isLoading, hasError } = useTokenData();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      {/* Top Section with Image and Chart */}
      <div className="w-full bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom py-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg">
              <AspectRatio ratio={16/9} className="bg-black">
                <img
                  src="/lovable-uploads/1bc16e31-2762-4b6d-a450-8c58910fee52.png"
                  alt="Cancer Treatment Information"
                  className="object-contain w-full h-full"
                />
              </AspectRatio>
            </div>
            <div className="w-full h-[500px]">
              <DexToolsChart />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Content Section */}
      <div className="relative min-h-[80vh] flex items-center bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cbis-teal opacity-5 blur-3xl"></div>
          <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-cbis-blue opacity-5 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-cbis-blue opacity-5 blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <HeroContent isLoaded={isLoaded} />
            <TokenCard 
              isLoaded={isLoaded}
              priceData={priceData}
              volumeData={volumeData}
              currentPrice={currentPrice}
              tokenInfo={tokenInfo}
              isLoading={isLoading}
              hasError={!!hasError}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
