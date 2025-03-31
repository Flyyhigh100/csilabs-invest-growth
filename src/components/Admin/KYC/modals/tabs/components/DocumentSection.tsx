
import React from 'react';
import KycDocumentImage from './KycDocumentImage';

interface DocumentSectionProps {
  title: string;
  imageUrl: string | null;
  onOpenFullImage: (url: string) => void;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({ 
  title, 
  imageUrl, 
  onOpenFullImage 
}) => {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
      <KycDocumentImage 
        url={imageUrl} 
        alt={title}
        onOpenFullImage={onOpenFullImage}
      />
    </div>
  );
};

export default DocumentSection;
