
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ResearchDocument } from '../../types/documentTypes';

export const useDeleteDocument = (
  documents: ResearchDocument[],
  setDocuments: React.Dispatch<React.SetStateAction<ResearchDocument[]>>,
  bucketName: string
) => {
  // Delete a document
  const deleteDocument = useCallback(async (docId: string) => {
    try {
      // Check if it's one of the fallback documents (which don't exist in storage)
      const isDefaultDoc = docId.startsWith('doc-') && !docId.includes('?');
      
      if (!isDefaultDoc) {
        // Extract the filename from the document ID
        const fileName = docId.replace('doc-', '');
        
        // Delete the file from storage
        const { error } = await supabase.storage
          .from(bucketName)
          .remove([fileName]);
          
        if (error) {
          console.error("Error deleting file:", error);
          toast.error("Failed to delete document");
          return false;
        }
      }
      
      // Update the documents state
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
      
      // Clear localStorage cache to force reload on the public page
      localStorage.removeItem('researchDocuments');
      
      toast.success("Document deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
      return false;
    }
  }, [bucketName, setDocuments, documents]);

  return { deleteDocument };
};
