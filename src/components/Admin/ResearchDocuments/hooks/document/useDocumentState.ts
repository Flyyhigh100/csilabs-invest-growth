
import { useState } from 'react';
import { ResearchDocument } from '../../types/documentTypes';

export const useDocumentState = () => {
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bucketName] = useState('research_documents');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return {
    documents,
    setDocuments,
    isLoading,
    setIsLoading,
    bucketName,
    isAuthenticated,
    setIsAuthenticated
  };
};
