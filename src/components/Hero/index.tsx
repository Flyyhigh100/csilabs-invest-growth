
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
    const fetchImage = async () => {
      try {
        // Convert the base64 image to a blob inside the async function
        const base64Response = await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        const imageBlob = await base64Response.blob();
        
        const { data: storageData, error: storageError } = await supabase.storage
          .from('hero-images')
          .upload('hero-image.png', imageBlob, {
            cacheControl: '3600',
            upsert: true,
          });

        if (storageError) {
          console.error('Error uploading image:', storageError);
          setImageError(true);
          return;
        }

        const { data } = supabase.storage
          .from('hero-images')
          .getPublicUrl('hero-image.png');

        setImageUrl(data.publicUrl);
      } catch (error) {
        console.error('Error handling image:', error);
        setImageError(true);
      }
    };
    
    // Call the async function
    fetchImage();
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
                  alt="Cancer Treatment Research" 
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
