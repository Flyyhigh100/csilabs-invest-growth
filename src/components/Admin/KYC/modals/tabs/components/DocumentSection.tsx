
import React from 'react';
import KycDocumentImage from './KycDocumentImage';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentSectionProps {
  title: string;
  imageUrl: string | null;
  onOpenFullImage: (url: string) => void;
  onZoomImage?: (url: string) => void;
  isLoading?: boolean;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({ 
  title, 
  imageUrl, 
  onOpenFullImage,
  onZoomImage,
  isLoading = false
}) => {
  const hasImage = !!imageUrl && imageUrl !== '';
  
  return (
    <div className="flex flex-col h-full">
      <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
      <div className="flex-1">
        {isLoading ? (
          <div className="w-full h-48 relative">
            <Skeleton className="w-full h-48 rounded-md" />
          </div>
        ) : hasImage ? (
          <KycDocumentImage 
            url={imageUrl} 
            alt={title}
            onOpenFullImage={onOpenFullImage}
            onZoomImage={onZoomImage}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-md border border-dashed border-gray-300">
            <p className="text-sm text-gray-400">No document available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentSection;
