
import React from 'react';
import { Button } from '@/components/ui/button';

interface UpdateHarvardDocumentProps {
  documentId: string;
}

const UpdateHarvardDocument: React.FC<UpdateHarvardDocumentProps> = ({ documentId }) => {
  const handleClick = () => {
    // Add the updateDoc parameter to the URL
    const url = new URL(window.location.href);
    url.searchParams.set('updateDoc', documentId);
    window.location.href = url.toString();
  };

  return (
    <Button onClick={handleClick}>
      Update Harvard Document Metadata
    </Button>
  );
};

export default UpdateHarvardDocument;
