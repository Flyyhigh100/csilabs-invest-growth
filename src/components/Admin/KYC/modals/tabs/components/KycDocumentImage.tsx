
import React, { useState, useEffect } from 'react';
import { Eye, ShieldAlert, ExternalLink, Loader2, AlertCircle, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KycDocumentImageProps { 
  url: string | null; 
  alt: string;
  onOpenFullImage: (url: string) => void;
  onZoomImage?: (url: string) => void;
}

const KycDocumentImage: React.FC<KycDocumentImageProps> = ({ 
  url, 
  alt, 
  onOpenFullImage,
  onZoomImage
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      setHasError(true);
      setErrorMessage('No image URL provided');
    } else {
      // Reset states when URL changes
      setIsLoading(true);
      setHasError(false);
      setErrorMessage(null);
    }
  }, [url]);
  
  const handleImageError = () => {
    console.warn(`Image failed to load: ${alt}`, url);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('Image failed to load');
  };
  
  const handleImageLoad = () => {
    console.log(`Image loaded successfully: ${alt}`);
    setIsLoading(false);
    setHasError(false);
  };
  
  const handleOpenFullImage = () => {
    if (url && !hasError) {
      onOpenFullImage(url);
    }
  };

  const handleZoomImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (url && !hasError && onZoomImage) {
      onZoomImage(url);
    }
  };
  
  const handleDirectLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!url) {
      toast.error('No URL available to open');
      return;
    }
    
    window.open(url, '_blank');
    toast.info('Opening image in new tab');
  };
  
  if (isLoading && url) {
    return (
      <div className="w-full h-48 relative rounded-md overflow-hidden">
        <Skeleton className="w-full h-48 rounded-md" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          {url && (
            <img 
              src={url} 
              alt={alt} 
              className="hidden" 
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          )}
        </div>
      </div>
    );
  }
  
  if (hasError || !url) {
    return (
      <div className="w-full h-48 bg-gray-50 rounded-md border border-gray-200 flex flex-col items-center justify-center p-4">
        <ShieldAlert className="h-10 w-10 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 text-center">
          Unable to load {alt.toLowerCase()}
        </p>
        {errorMessage && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 max-w-xs text-center">
            <AlertCircle className="h-3 w-3 inline-block mr-1" />
            {errorMessage}
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
    <div className="relative group cursor-pointer rounded-md overflow-hidden" onClick={handleOpenFullImage}>
      <img 
        src={url} 
        alt={alt} 
        className="w-full h-48 object-cover rounded-md border border-gray-200 transition-all duration-200 group-hover:opacity-90" 
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  onClick={handleOpenFullImage}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open in new tab</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {onZoomImage && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white"
                    onClick={handleZoomImage}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
};

export default KycDocumentImage;
