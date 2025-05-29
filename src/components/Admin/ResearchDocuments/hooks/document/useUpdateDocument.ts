
import { useCallback } from 'react';
import { toast } from 'sonner';
import { ResearchDocument } from '../../types/documentTypes';
import { useDocumentService } from './useDocumentService';

export const useUpdateDocument = (
  documents: ResearchDocument[],
  setDocuments: React.Dispatch<React.SetStateAction<ResearchDocument[]>>
) => {
  const { updateDocumentMetadata } = useDocumentService();

  // Update document metadata using the database service
  const updateDocument = useCallback(async (docId: string, updatedData: Partial<ResearchDocument>) => {
    try {
      console.log("Updating document metadata:", docId, updatedData);
      
      // Find the document to update
      const docIndex = documents.findIndex(doc => doc.id === docId);
      
      if (docIndex === -1) {
        toast.error("Document not found");
        return false;
      }
      
      // Use the database service to update metadata
      const success = await updateDocumentMetadata(docId, updatedData);
      
      if (success) {
        // Update the document in state
        const updatedDoc = {
          ...documents[docIndex],
          ...updatedData
        };
        
        const newDocs = [...documents];
        newDocs[docIndex] = updatedDoc;
        setDocuments(newDocs);
        
        // Clear localStorage cache to force reload on the public page
        localStorage.removeItem('researchDocuments');
        
        toast.success(`Document "${updatedDoc.title}" updated successfully`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error updating document metadata:", error);
      toast.error("Failed to update document metadata");
      return false;
    }
  }, [documents, setDocuments, updateDocumentMetadata]);

  return { updateDocumentMetadata: updateDocument };
};
