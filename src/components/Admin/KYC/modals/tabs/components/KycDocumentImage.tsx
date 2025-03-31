
import React, { useState, useEffect } from 'react';
import { getKycDocumentUrl, verifyImageUrl, checkBucketExists } from '@/utils/admin/kycUtils';
import { FileImage, ShieldAlert, ExternalLink, Maximize2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface KycDocumentImageProps { 
  url: string | null; 
  alt: string;
  onOpenFullImage: (url: string) => void;
}

const KycDocumentImage: React.FC<KycDocumentImageProps> = ({ 
  url, 
  alt, 
  onOpenFullImage
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isBucketError, setIsBucketError] = useState(false);
  const [isBucketChecked, setIsBucketChecked] = useState(false);
  
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
        
        console.log('Original URL:', url);
        
        // Get public URL
        const processedUrl = await getKycDocumentUrl(url);
        console.log('Processed URL:', processedUrl);
        
        // Verify URL format
        const validUrl = verifyImageUrl(processedUrl);
        
        if (validUrl) {
          setImageUrl(validUrl);
          
          // Check if the bucket exists if not already checked
          if (!isBucketChecked) {
            const bucketName = validUrl.includes('/kyc_documents/') ? 'kyc_documents' : 'documents';
            const exists = await checkBucketExists(bucketName);
            if (!exists) {
              console.warn(`Storage bucket '${bucketName}' not found!`);
              setIsBucketError(true);
            }
            setIsBucketChecked(true);
          }
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
  }, [url, alt, isBucketChecked]);
  
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
  
  const handleDirectLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!imageUrl) return;
    
    window.open(imageUrl, '_blank');
    toast.info('Opening image in new tab');
  };
  
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Skeleton className="w-full h-48 rounded-md" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
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

export default KycDocumentImage;
