
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
  console.log(`Rendering DocumentSection for ${title} with URL:`, imageUrl);
  
  return (
    <div className="flex flex-col h-full">
      <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
      <div className="flex-1">
        {isLoading ? (
          <div className="w-full h-48 relative">
            <Skeleton className="w-full h-48 rounded-md" />
          </div>
        ) : (
          <KycDocumentImage 
            url={imageUrl} 
            alt={title}
            onOpenFullImage={onOpenFullImage}
            onZoomImage={onZoomImage}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentSection;
