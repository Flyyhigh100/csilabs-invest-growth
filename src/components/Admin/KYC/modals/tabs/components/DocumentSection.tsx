
import React from 'react';
import KycDocumentImage from './KycDocumentImage';

interface DocumentSectionProps {
  title: string;
  imageUrl: string | null;
  onOpenFullImage: (url: string) => void;
  onZoomImage?: (url: string) => void;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({ 
  title, 
  imageUrl, 
  onOpenFullImage,
  onZoomImage
}) => {
  return (
    <div className="flex flex-col h-full">
      <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
      <div className="flex-1">
        <KycDocumentImage 
          url={imageUrl} 
          alt={title}
          onOpenFullImage={onOpenFullImage}
          onZoomImage={onZoomImage}
        />
      </div>
    </div>
  );
};

export default DocumentSection;
