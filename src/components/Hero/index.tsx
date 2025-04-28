
import React, { useEffect, useState } from 'react';
import HeroContent from './HeroContent';
import TokenCard from './TokenCard';
import { useTokenData } from '@/hooks/useTokenData';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const { priceData, volumeData, currentPrice, tokenInfo, isLoading, hasError } = useTokenData();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Set the image URL directly to the newly uploaded image
    setImageUrl('public/lovable-uploads/a6a43379-47a6-41cb-ba9b-9f5dfa312430.png');
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
        {/* Top Section: Image and Token Card */}
        <div className={`grid md:grid-cols-2 gap-6 mb-12 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {/* Left Column: Cancer Treatment Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-elevation bg-white">
            <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
              {!imageUrl && !imageError ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <img 
                  src={imageUrl || '/placeholder.svg'}
                  alt="Cannabis Science Cancer Treatment Research" 
                  className="w-full h-full object-cover"
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

        {/* Bottom Section: Hero Content */}
        <HeroContent isLoaded={isLoaded} />
      </div>
    </div>
  );
};

export default Hero;
