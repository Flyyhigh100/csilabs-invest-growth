
import React, { useState, useEffect } from 'react';
import { KycVerificationWithProfile } from '../../types';
import { getKycDocumentUrl, verifyImageUrl } from '@/utils/admin/kycUtils';
import { FileImage, ShieldAlert, ExternalLink, Maximize2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

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
  const [isBucketError, setIsBucketError] = useState(false);
  
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
        setIsBucketError(false);
        
        console.log('Original URL:', url);
        
        // Get signed URL if needed
        const processedUrl = await getKycDocumentUrl(url);
        console.log('Processed URL:', processedUrl);
        
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
  
  const checkBucketExistence = async (bucketName: string) => {
    try {
      const { data, error } = await supabase.storage.getBucket(bucketName);
      if (error) {
        console.error(`Bucket ${bucketName} not found:`, error);
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Error checking bucket ${bucketName}:`, error);
      return false;
    }
  };
  
  // Extract bucket name from URL
  const getBucketFromUrl = (url: string | null): string | null => {
    if (!url) return null;
    const match = url.match(/\/storage\/v1\/object\/public\/([^\/]+)/);
    return match ? match[1] : null;
  };
  
  const handleDirectLinkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!url) return;
    
    try {
      // Check if it's a bucket issue
      const bucketName = getBucketFromUrl(url) || 'kyc_documents';
      const exists = await checkBucketExistence(bucketName);
      
      if (!exists) {
        setIsBucketError(true);
        toast.error(`Storage bucket '${bucketName}' not found. Admin needs to create this bucket.`);
        return;
      }
      
      // If bucket exists but we still have an issue, try to open it directly
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error with direct link:', error);
      window.open(url, '_blank');
    }
  };
  
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Skeleton className="w-full h-48 rounded-md" />
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
        {isBucketError && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 max-w-xs text-center">
            <AlertCircle className="h-3 w-3 inline-block mr-1" />
            Storage bucket not found. This needs to be created in Supabase.
          </div>
        )}
        {url && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 text-xs"
            onClick={handleDirectLinkClick}
          >
            Try Direct Link
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        )}
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
        <span className="text-white text-sm font-medium flex items-center">
          <Maximize2 className="mr-1 h-4 w-4" />
          View Full Image
        </span>
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
