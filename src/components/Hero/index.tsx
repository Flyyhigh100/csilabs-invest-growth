
import React, { useEffect, useState } from 'react';
import HeroContent from './HeroContent';
import TokenCard from './TokenCard';
import { useTokenData } from '@/hooks/useTokenData';

const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { priceData, volumeData, currentPrice, tokenInfo, isLoading, hasError } = useTokenData();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cbis-teal opacity-5 blur-3xl"></div>
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-cbis-blue opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-cbis-blue opacity-5 blur-3xl"></div>
      </div>

      <div className="container-custom relative z-10 pt-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <HeroContent isLoaded={isLoaded} />
          <TokenCard 
            isLoaded={isLoaded}
            priceData={priceData}
            volumeData={volumeData}
            currentPrice={currentPrice}
            tokenInfo={tokenInfo}
            isLoading={isLoading}
            hasError={!!hasError} // Convert Error object to boolean
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
