
import { useCallback } from 'react';
import { toast } from 'sonner';
import { ResearchDocument } from '../../types/documentTypes';

export const useAddDocument = (
  setDocuments: React.Dispatch<React.SetStateAction<ResearchDocument[]>>
) => {
  // Add a new document
  const addDocument = useCallback((newDocument: ResearchDocument) => {
    setDocuments(prevDocs => [...prevDocs, newDocument]);
    toast.success(`Document "${newDocument.title}" added successfully`);
    
    // Clear localStorage cache to force reload on the public page
    localStorage.removeItem('researchDocuments');
  }, [setDocuments]);

  return { addDocument };
};
