
import { useCallback } from 'react';
import { ResearchDocument, DocumentFormValues } from '../../types/documentTypes';
import { useDocumentService } from './useDocumentService';
import { toast } from 'sonner';

export const useDocumentMutations = (
  documents: ResearchDocument[],
  setDocuments: React.Dispatch<React.SetStateAction<ResearchDocument[]>>
) => {
  const { uploadDocument, deleteDocument, updateDocumentMetadata } = useDocumentService();

  // Add document to state after successful upload
  const addDocument = useCallback((newDocument: ResearchDocument) => {
    setDocuments(prevDocs => [newDocument, ...prevDocs]);
    toast.success(`Document "${newDocument.title}" added successfully`);
    
    // Clear localStorage cache to force reload on the public page
    localStorage.removeItem('researchDocuments');
  }, [setDocuments]);

  // Handle document upload including file upload and metadata creation
  const handleDocumentUpload = useCallback(async (file: File, values: DocumentFormValues): Promise<boolean> => {
    try {
      // Upload document to storage and save metadata to database
      const newDocument = await uploadDocument(file, values);
      
      // Add the new document to state
      addDocument(newDocument);
      return true;
    } catch (error) {
      console.error("Error uploading document:", error);
      return false;
    }
  }, [uploadDocument, addDocument]);

  // Delete document from storage and database
  const handleDeleteDocument = useCallback(async (docId: string): Promise<boolean> => {
    try {
      const success = await deleteDocument(docId);
      
      if (success) {
        // Update state by removing the deleted document
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
        
        // Clear localStorage cache to force reload on the public page
        localStorage.removeItem('researchDocuments');
        
        toast.success("Document deleted successfully");
      }
      
      return success;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  }, [deleteDocument, setDocuments]);

  // Update document metadata
  const handleUpdateDocument = useCallback(async (docId: string, data: Partial<ResearchDocument>): Promise<boolean> => {
    try {
      const success = await updateDocumentMetadata(docId, data);
      
      if (success) {
        // Update document in state
        setDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc.id === docId 
              ? { ...doc, ...data }
              : doc
          )
        );
        
        // Clear localStorage cache to force reload on the public page
        localStorage.removeItem('researchDocuments');
        
        toast.success("Document updated successfully");
      }
      
      return success;
    } catch (error) {
      console.error("Error updating document metadata:", error);
      return false;
    }
  }, [updateDocumentMetadata, setDocuments]);

  return {
    addDocument,
    uploadDocument: handleDocumentUpload,
    deleteDocument: handleDeleteDocument,
    updateDocumentMetadata: handleUpdateDocument
  };
};
