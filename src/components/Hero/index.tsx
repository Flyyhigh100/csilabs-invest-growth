
import React, { useEffect, useState } from 'react';
import HeroContent from './HeroContent';
import TokenCard from './TokenCard';
import { useTokenData } from '@/hooks/useTokenData';
import { Skeleton } from '@/components/ui/skeleton';
import { TokenPriceProvider } from '@/context/TokenPriceContext';

const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [heroImageError, setHeroImageError] = useState(false);
  const { priceData, volumeData, currentPrice, tokenInfo, isLoading, hasError } = useTokenData();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cbis-teal opacity-5 blur-3xl"></div>
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-cbis-blue opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-cbis-blue opacity-5 blur-3xl"></div>
      </div>

      <div className="container-custom relative z-10 pt-20">
        <div className={`grid md:grid-cols-2 gap-6 mb-12 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {/* Left Column: Cancer Treatment Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-elevation bg-white">
            <div className="w-full bg-gray-100 flex items-center justify-center p-4">
              {!isLoaded ? (
                <Skeleton className="w-full aspect-auto" />
              ) : (
                <img 
                  src="/rawwhiteonepagepng.png"
                  alt="Cannabis Science Cancer Treatment Research" 
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/placeholder.svg';
                    setImageError(true);
                  }}
                />
              )}
            </div>
          </div>

          {/* Right Column: Token Card */}
          <TokenPriceProvider>
            <TokenCard 
              isLoaded={isLoaded}
              priceData={priceData}
              volumeData={volumeData}
              currentPrice={currentPrice}
              tokenInfo={tokenInfo}
              isLoading={isLoading}
              hasError={!!hasError}
            />
          </TokenPriceProvider>
        </div>

        {/* Bottom Section: Hero Content with Image */}
        <div className={`grid md:grid-cols-2 gap-8 mb-12 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {/* Left Column: Hero Content */}
          <HeroContent isLoaded={isLoaded} />
          
          {/* Right Column: Dr. Ray Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-elevation bg-white">
            <div className="w-full h-full bg-gray-100 flex items-center justify-center p-4">
              {!isLoaded ? (
                <Skeleton className="w-full aspect-auto" />
              ) : (
                <img 
                  src="/cryptologo_ray.jpg"
                  alt="CBIS Ray Crypto Logo" 
                  className="w-full h-auto object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/placeholder.svg';
                    setHeroImageError(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
