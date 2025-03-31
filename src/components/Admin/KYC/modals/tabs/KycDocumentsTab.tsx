
import React, { useState, useEffect } from 'react';
import { KycVerificationWithProfile } from '../../types';
import { getKycDocumentUrl, verifyImageUrl } from '@/utils/admin/kycUtils';
import { FileImage, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface KycDocumentsTabProps {
  kyc: KycVerificationWithProfile;
}

const KycDocumentImage = ({ 
  url, 
  alt, 
  onOpenFullImage
}: { 
  url: string | null; 
  alt: string;
  onOpenFullImage: (url: string) => void;
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const loadImage = async () => {
      if (!url) {
        setIsLoading(false);
        setHasError(true);
        return;
      }
      
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Get signed URL if needed
        const processedUrl = await getKycDocumentUrl(url);
        
        // Verify URL format
        const validUrl = verifyImageUrl(processedUrl);
        
        if (validUrl) {
          setImageUrl(validUrl);
        } else {
          console.error('Invalid image URL:', url);
          setHasError(true);
        }
      } catch (error) {
        console.error(`Error loading ${alt} image:`, error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadImage();
  }, [url, alt]);
  
  const handleImageError = () => {
    console.warn(`Image failed to load: ${alt}`);
    setHasError(true);
  };
  
  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };
  
  const handleImageClick = () => {
    if (imageUrl && !hasError) {
      onOpenFullImage(imageUrl);
    }
  };
  
  if (isLoading) {
    return (
      <div className="w-full h-48 bg-gray-100 animate-pulse rounded-md border border-gray-200 flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }
  
  if (hasError || !imageUrl) {
    return (
      <div className="w-full h-48 bg-gray-50 rounded-md border border-gray-200 flex flex-col items-center justify-center p-4">
        <ShieldAlert className="h-10 w-10 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 text-center">
          Unable to load {alt.toLowerCase()}
        </p>
      </div>
    );
  }
  
  return (
    <div className="relative group cursor-pointer" onClick={handleImageClick}>
      <img 
        src={imageUrl} 
        alt={alt} 
        className="w-full h-48 object-cover rounded-md border border-gray-200 transition-all duration-200 group-hover:opacity-90" 
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100">
        <span className="text-white text-sm font-medium">Click to view</span>
      </div>
    </div>
  );
};

const KycDocumentsTab: React.FC<KycDocumentsTabProps> = ({ kyc }) => {
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  
  const openFullImage = (url: string) => {
    setFullImageUrl(url);
    window.open(url, '_blank');
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">ID Front</p>
          <KycDocumentImage 
            url={kyc.id_front_url} 
            alt="ID Front"
            onOpenFullImage={openFullImage}
          />
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">ID Back</p>
          <KycDocumentImage 
            url={kyc.id_back_url} 
            alt="ID Back"
            onOpenFullImage={openFullImage}
          />
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Selfie with ID</p>
          <KycDocumentImage 
            url={kyc.selfie_url} 
            alt="Selfie with ID"
            onOpenFullImage={openFullImage}
          />
        </div>
      </div>
      
      {/* Debug info - only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info (Dev Only)</h4>
          <div className="space-y-2 text-xs text-gray-500">
            <p><strong>ID Front URL:</strong> {kyc.id_front_url || 'None'}</p>
            <p><strong>ID Back URL:</strong> {kyc.id_back_url || 'None'}</p>
            <p><strong>Selfie URL:</strong> {kyc.selfie_url || 'None'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycDocumentsTab;
